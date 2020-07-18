const path = require("path");
const { app, BrowserWindow, globalShortcut } = require("electron");
const isDev = require("electron-is-dev");

const size = {
  width: 700,
  minHeight: 112,
  maxHeight: 500,
};

let mainWindow = null;
function createWindow() {
  const BUILD_DIR = path.resolve(__dirname, "../build");
  const PRELOAD_PATH = path.resolve(__dirname, "preload.js");
  const LOGO_PATH = path.resolve(__dirname, "logo.png");

  const cfg = {
    resizable: false,
    fullscreenable: false,
    maximizable: false,
    width: size.width,
    height: size.minHeight,
    center: true,
    titleBarStyle: "hidden",
    webPreferences: {
      nodeIntegration: false,
      preload: PRELOAD_PATH,
    },
    icon: LOGO_PATH,
  };

  mainWindow = new BrowserWindow(cfg);
  process.platform === "darwin" && app.dock.setIcon(LOGO_PATH);
  mainWindow.loadURL(isDev ? "http://localhost:3000" : `file://${path.resolve(BUILD_DIR, "index.html")}`);
}

app.on("ready", createWindow);

// app.whenReady().then(() => {
//   globalShortcut.register("Command+Shift+Space", () => {
//     mainWindow.moveTop();
//   });
// });
