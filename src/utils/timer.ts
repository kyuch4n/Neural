import neuralDb, { Tag } from "./database";
import tagDefault from "../configs/tag-default.json";
import { show } from "./window";

interface TimerOption {
  interval?: number;
  callback?: Function;
}

export default class Timer {
  private id: number | null = null;
  private interval: number;
  private callback?: Function | null = null;

  constructor(opts: TimerOption = {}) {
    this.interval = opts.interval || tagDefault.expireCheckInterval;
    this.callback = opts.callback || null;
  }

  start(callback: Function) {
    if (!this.id) {
      this.callback = callback;
      this.id = this.rollup();
    }
  }

  stop() {
    this.id && window.clearInterval(this.id);
    this.id = null;
    this.callback = null;
  }

  notify(tag: Tag) {
    let notification = new Notification(tag.name, {
      tag: tag.name,
      body: tag.descriptions || "您有一个标签待处理，点击查看",
    });

    notification.onclick = (event: any) => {
      show();
      this.callback!(event.target.title);
    };
  }

  rollup() {
    let self = this;

    return window.setInterval(async () => {
      let result: any = await neuralDb.query_tag_is_expired();
      result.map((i: Tag) => self.notify(i));
    }, this.interval);
  }
}
