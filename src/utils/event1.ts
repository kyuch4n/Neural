export function unReload() {
  window.onkeydown = function (e: any) {
    const ev = window.event || e;
    const code = ev.keyCode || ev.which;
    if ((ev.ctrlKey || ev.metaKey) && code === 82) {
      console.warn("Reload is not allowed!");
      return false;
    }
  };
}

export function regist() {
  unReload();
}

export default {
  regist,
};
