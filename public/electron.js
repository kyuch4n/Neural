const path = require("path");
const { app, BrowserWindow } = require("electron");
const isDev = require("electron-is-dev");

const size = {
  width: 700,
  minHeight: 60,
  maxHeight: 500,
};

let mainWindow = null;
function createWindow() {
  const BUILD_DIR = path.resolve(__dirname, "../build");
  const PRELOAD_PATH = path.resolve(__dirname, "preload.js");
  const LOGO_PATH = path.resolve(__dirname, "logo.png");

  const cfg = {
    width: size.width,
    height: size.minHeight,
    center: true,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      preload: PRELOAD_PATH,
    },
    icon: LOGO_PATH,
  };
  process.platform === "darwin" && app.dock.setIcon(LOGO_PATH);

  mainWindow = new BrowserWindow(cfg);
  const loadUrl = isDev
    ? "http://localhost:3000"
    : `file://${path.resolve(BUILD_DIR, "index.html")}`;
  mainWindow.loadURL(loadUrl);
}

app.on("ready", createWindow);

app.on("window-all-closed", () => (mainWindow = null));

app.on("activate", () => mainWindow === null && createWindow());
