const electron = require("electron");

const { remote, ipcRenderer, clipboard } = electron;

window.ipcRenderer = ipcRenderer;
window.remote = remote;
window.clipboard = clipboard;
