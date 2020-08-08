const path = require("path");
const { app, BrowserWindow } = require("electron");
const isDev = require("electron-is-dev");

let mainWindow = null;

const createWindow = () => {
  const BUILD_DIR = path.resolve(__dirname, "../build");
  const PRELOAD_PATH = path.resolve(__dirname, "preload.js");
  const LOGO_PATH = path.resolve(__dirname, "logo.png");

  mainWindow = new BrowserWindow({
    width: 700,
    height: 60,
    center: true,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      preload: PRELOAD_PATH,
    },
    icon: LOGO_PATH,
  });

  if (process.platform === "darwin") {
    app.dock.setIcon(LOGO_PATH);
  }

  const devUrl = "http://localhost:3000";
  const prodUrl = `file://${path.resolve(BUILD_DIR, "index.html")}`;
  const loadUrl = isDev ? devUrl : prodUrl;
  mainWindow.loadURL(loadUrl);
  registWindowEvent();
};

const registWindowEvent = () => {
  mainWindow.on("close", (e) => {
    mainWindow.hide();
    e.preventDefault();
  });
};

app.on("ready", createWindow);

app.on("activate", () => {
  if (mainWindow) {
    mainWindow.show();
  }
});
