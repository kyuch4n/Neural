import size from "../configs/win-size.json";

export enum SizeType {
  MIN = 0,
  MAX = 1,
}

export const show = () => {
  const win = window.remote.getCurrentWindow();
  win.show();
};

export const resizeTo = (sizeType: SizeType) => {
  const win = window.remote.getCurrentWindow();

  switch (sizeType) {
    case SizeType.MIN:
      win.setSize(size.width, size.minHeight);
      break;
    case SizeType.MAX:
      win.setSize(size.width, size.maxHeight);
      break;
  }
};

export const shake = () => {
  const win = window.remote.getCurrentWindow();
  const [startX, startY] = win.getPosition();
  const distance = 5;
  const moveArrry = [
    { x: -1 * distance, y: -1 * distance },
    { x: distance, y: -1 * distance },
    { x: -1 * distance, y: 5 },
    { x: distance, y: distance },
    { x: 0, y: 0 },
  ];

  const routeArray = moveArrry.map((item) => ({ x: item.x + startX, y: item.y + startY }));
  routeArray.forEach((r) => win.setPosition(r.x, r.y));
};
