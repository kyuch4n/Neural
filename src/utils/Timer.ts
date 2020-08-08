import nerualDb from "./Database";
import tagDefault from "../configs/tag-default.json";

interface TimerOption {
  interval?: number; // ms
}

export default class Timer {
  private id?: number;
  private interval: number;

  constructor(opts: TimerOption = {}) {
    this.interval = opts.interval || tagDefault.expireCheckInterval;
  }

  start() {
    this.id = window.setInterval(this.rollup, this.interval);
  }

  stop() {
    this.id && window.clearInterval(this.id);
  }

  async rollup() {
    // TODO:
    let result = await nerualDb.query_tag_is_expired();
    console.log(result)
  }
}
