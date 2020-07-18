import React, { FC } from "react";
import "./App.scss";
import SmartComponent from "./components/SmartInput";
import MoreIcon from "./components/MoreIcon";

const App: FC = () => {
  return (
    <div className="app-container">
      <SmartComponent />
      <MoreIcon />
    </div>
  );
};

export default App;
