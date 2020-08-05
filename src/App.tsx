import React, { FC, useReducer } from "react";
import "./App.scss";
import SmartComponent from "./components/SmartInput";
import MoreIcon from "./components/MoreIcon";
import size from "./configs/win-size.json";

interface IState {
  folded: boolean;
}

enum ActionType {
  TOGGLE_FOLDED,
}

interface IAction {
  type: ActionType;
}

const App: FC = () => {
  let initialState: IState = {
    folded: true,
  };

  let resize = (folded: boolean) => {
    let win = window.remote.getCurrentWindow();
    if (folded) {
      win.setSize(size.width, size.minHeight);
    } else {
      win.setSize(size.width, size.maxHeight);
    }
  };

  let reducer = (state: IState, action: IAction) => {
    switch (action.type) {
      case ActionType.TOGGLE_FOLDED:
        let folded = !state.folded;
        resize(folded);
        return { ...state, folded };
      default:
        throw new Error("Unexpected action");
    }
  };

  let [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div className="app-container">
      <SmartComponent />
      <MoreIcon
        folded={state.folded}
        onClick={() => dispatch({ type: ActionType.TOGGLE_FOLDED })}
      />
    </div>
  );
};

export default App;
