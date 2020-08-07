import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

declare global {
  interface Window {
    remote: any;
    clipboard: any;
    ipcRenderer: any;
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
