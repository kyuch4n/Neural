import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import Event from "./utils/event";

declare global {
  interface Window {
    remote: any;
    clipboard: any;
    ipcRenderer: any;
  }
}

Event.regist();
ReactDOM.render(<App />, document.getElementById("root"));
