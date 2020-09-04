const path = require("path");
const { app, BrowserWindow, Tray, globalShortcut } = require("electron");
const isDev = require("electron-is-dev");

/************************************************************************************************
 * BrowserWindow
 ************************************************************************************************/
let mainWindow = null;
const createWindow = () => {
  const BUILD_DIR = path.resolve(__dirname, "../build");
  const PRELOAD_PATH = path.resolve(__dirname, "preload.js");
  const LOGO_PATH = path.resolve(__dirname, "logo512.png");

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
    app.dock.hide();
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

/************************************************************************************************
 * Tray
 ************************************************************************************************/

let tray;
const createTray = () => {
  const LOGO_PATH = path.resolve(__dirname, "logo32@2x.png");
  tray = new Tray(LOGO_PATH);
  tray.setToolTip("Neural");
  registTrayEvent();
};

const registTrayEvent = () => {
  tray.on("click", () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });
};

/************************************************************************************************
 * globalShortcut
 ************************************************************************************************/

const registerGs = () => {
  globalShortcut.register("CommandOrControl+>", () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });
};

const unregisterGsAll = () => {
  globalShortcut.unregisterAll();
};

app.on("ready", () => {
  createWindow();
  createTray();
  registerGs();
});

app.on("activate", () => {
  if (mainWindow) {
    mainWindow.show();
  }
});

app.on("before-quit", () => {
  unregisterGsAll();
  app.exit();
});
