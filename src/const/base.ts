export enum Symb {
  ALL = "ALL",
}

export enum IDBReadyState {
  PENDING = "pending",
  DONE = "done",
}

export enum EventType {
  UpsertTag,
  DeleteTag,
}

export enum TagStatus {
  PENDING = "pending",
  DONE = "done",
}

export const WinSize = {
  width: 700,
  minHeight: 60,
  maxHeight: 500,
};

export const TagDefault = {
  expires: 86400000, // "默认过期时间：1d"
  expireCheckInterval: 600000, // "巡查间隔：10min"
};
