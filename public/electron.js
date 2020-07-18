const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    titleBarStyle: "hidden",
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    width: 700,
    // height: 102,
    height: 600,
    icon: path.join(__dirname, "logo512.png"),
  });

  if (process.platform === "darwin") {
    app.dock.setIcon(path.join(__dirname, "logo512.png"));
  }

  mainWindow.loadURL(isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../build/index.html")}`);
  mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  if (mainWindow === null) createWindow();
});
