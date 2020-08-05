const electron = require("electron");

const { remote, ipcRenderer } = electron;

global.electron = electron;
window.ipcRenderer = ipcRenderer;
window.remote = remote;
