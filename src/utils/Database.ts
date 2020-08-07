import shortid from "shortid";
import tagDefault from "../configs/tag-default.json";

enum IDBReadyState {
  PENDING = "pending",
  DONE = "done",
}

export enum EventType {
  UpsertTag,
  DeleteTag,
}

export interface Tag {
  id?: string;
  name: string;
  descriptions?: string;
  wikis?: Array<string>;
  expires?: number;
}

export interface Observer {
  eventType: EventType;
  callback: Function;
}

export class NeuralDB {
  private static instance: NeuralDB;
  private static DB_VERSION: number = 1;
  private static STORE_TAG = "Tag";

  private request: IDBOpenDBRequest;
  private db_ins: any;
  private sqlQueue: Array<Function> = [];

  private observers: {
    [eventType: string]: Array<Function>;
  } = {};

  private constructor() {
    this.request = window.indexedDB.open("Neural-Database", NeuralDB.DB_VERSION);
    this.request.onsuccess = this.onSuccess.bind(this);
    this.request.onupgradeneeded = this.onUpgrade;
  }

  private onSuccess() {
    this.db_ins = this.request.result;

    // 清空回调队列
    while (this.sqlQueue.length) {
      let callback = this.sqlQueue.shift();
      callback && callback();
    }
  }

  private onUpgrade(this: IDBOpenDBRequest) {
    let db_ins = this.result;

    // 建库 Tag
    if (!db_ins.objectStoreNames.contains(NeuralDB.STORE_TAG)) {
      let objectStore = db_ins.createObjectStore(NeuralDB.STORE_TAG, {
        keyPath: "id",
      });

      // 索引 ID
      objectStore.createIndex("id", "id", {
        unique: true,
      });

      // 索引 NAME
      objectStore.createIndex("name", "name", {
        unique: true,
      });
    }
  }

  public static getInstance() {
    if (!NeuralDB.instance) {
      NeuralDB.instance = new NeuralDB();
    }

    return NeuralDB.instance;
  }

  public ready(callback: Function) {
    if (this.request.readyState !== IDBReadyState.DONE) {
      this.sqlQueue.push(callback);
      return;
    }
    callback();
  }

  // ================================================================================================================
  // 事件订阅
  // ================================================================================================================

  public addObserver(observer: Observer) {
    let { eventType, callback } = observer;
    let callbackList = this.observers[eventType] || [];
    if (callbackList.indexOf(callback) < 0) {
      this.observers[eventType] = callbackList.concat(callback);
    }
  }

  public removeObserver(observer: Observer) {
    let { eventType, callback } = observer;
    let callbackList = this.observers[eventType] || [];
    for (let i = 0; i < callbackList.length; i++) {
      if (callbackList[i] === callback) {
        this.observers[eventType].splice(i, 1);
        return;
      }
    }
  }

  private notify(eventType: EventType) {
    let callbackList = this.observers[eventType] || [];
    for (let i = 0; i < callbackList.length; i++) {
      callbackList[i]({
        eventType,
      });
    }
  }

  // ================================================================================================================
  // 事件订阅 End
  // ================================================================================================================

  // ================================================================================================================
  // Tag SQL
  // ================================================================================================================

  /**
   * 增改 Tag
   * @param tag
   */
  public upsert_tag(tag: Tag) {
    // Id
    let id = shortid.generate();
    tag.id = tag.id || id;

    // 默认过期时间
    let expires = new Date().getTime() + tagDefault.expires;
    tag.expires = tag.expires || expires;

    let transaction = this.db_ins.transaction(NeuralDB.STORE_TAG, "readwrite");
    let store = transaction.objectStore(NeuralDB.STORE_TAG);

    return new Promise((res, rej) => {
      let putRequest = store.put(tag);
      putRequest.onsuccess = () => {
        this.notify(EventType.UpsertTag);
        res(true);
      };
      putRequest.onerror = (err: any) => rej(err);
    });
  }

  /**
   * 根据 id 删除对应的 Tag
   * @param id
   */
  public delete_tag_by_id(id: string) {
    let transaction = this.db_ins.transaction(NeuralDB.STORE_TAG, "readwrite");
    let store = transaction.objectStore(NeuralDB.STORE_TAG);

    return new Promise((res, rej) => {
      let deleteRequest = store.delete(id);
      deleteRequest.onsuccess = () => {
        this.notify(EventType.DeleteTag);
        res(true);
      };
      deleteRequest.onerror = (err: any) => rej(err);
    });
  }

  /**
   * 分页查询
   * @param pageNo
   * @param pageSize
   */
  public query_tag_by_paging(pageNo = 1, pageSize = 10) {
    let transaction = this.db_ins.transaction(NeuralDB.STORE_TAG, "readonly");
    let store = transaction.objectStore(NeuralDB.STORE_TAG);

    let p0 = new Promise((res, rej) => {
      let countRequest = store.count();
      countRequest.onsuccess = () => res(countRequest.result);
      countRequest.onerror = (err: any) => rej(err);
    });

    let p1 = new Promise((res, rej) => {
      let list: Array<Tag> = [];
      let step = (pageNo - 1) * pageSize;
      let advanced = false;

      let cursorRequest = store.openCursor();
      cursorRequest.onsuccess = function (event: any) {
        let cursor = event.target.result;
        // eslint-disable-next-line no-sequences
        if (!advanced && !!step) return cursor.advance(step), (advanced = true);
        if (!cursor || list.length >= pageSize) return res(list);
        list.push(cursor.value);
        cursor.continue();
      };
      cursorRequest.onerror = (err: any) => rej(err);
    });

    return Promise.all([p0, p1]).then(([total, list]) => ({ total, list }));
  }

  /**
   * 根据 id 查询对应的 Tag
   * @param id
   */
  public query_tag_by_id(id: string) {
    let transaction = this.db_ins.transaction(NeuralDB.STORE_TAG, "readonly");
    let store = transaction.objectStore(NeuralDB.STORE_TAG);

    return new Promise((res, rej) => {
      let getReuest = store.get(id);
      getReuest.onsuccess = () => res(getReuest.result);
      getReuest.onerror = (err: any) => rej(err);
    });
  }

  /**
   * 根据 tagName 模糊匹配
   * @param keyword
   * @param limit
   */
  public match_tag_by_name(keyword: string, limit: number = 10) {
    let transaction = this.db_ins.transaction(NeuralDB.STORE_TAG, "readonly");
    let store = transaction.objectStore(NeuralDB.STORE_TAG);

    return new Promise((res, rej) => {
      let list: Array<Tag> = [];
      let cursorRequest = store.openCursor();

      cursorRequest.onsuccess = function (event: any) {
        let cursor = event.target.result;
        if (!cursor || list.length >= limit) return res(list);

        let name = cursor.value.name;
        let lcName = name.toLowerCase();
        let lcKeyword = keyword.toLowerCase();
        if (lcName.indexOf(lcKeyword) > -1) {
          name === keyword ? list.unshift(cursor.value) : list.push(cursor.value);
        }

        cursor.continue();
      };
      cursorRequest.onerror = (err: any) => rej(err);
    });
  }

  /**
   * 查询过期 tag
   */
  public query_tag_is_expired() {
    let transaction = this.db_ins.transaction(NeuralDB.STORE_TAG, "readonly");
    let store = transaction.objectStore(NeuralDB.STORE_TAG);

    return new Promise((res, rej) => {
      let list: Array<Tag> = [];
      let cursorRequest = store.openCursor();
      let currentTime = new Date().getTime();

      cursorRequest.onsuccess = function (event: any) {
        let cursor = event.target.result;
        if (!cursor) return res(list);
        if (cursor.value.expires <= currentTime) list.push(cursor.value);
        cursor.continue();
      };
      cursorRequest.onerror = (err: any) => rej(err);
    });
  }

  // ================================================================================================================
  // Tag SQL End
  // ================================================================================================================
}

export default NeuralDB.getInstance();
