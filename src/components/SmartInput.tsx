import React, { FC, useState } from "react";
import { Input } from "antd";
import "./SmartInput.scss";
import { SearchOutlined } from "@ant-design/icons";

const SmartInput: FC = () => {
  let initialValue = "";
  let [value, setValue] = useState(initialValue);

  let handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  let handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      console.log(value);
    }
  };

  return (
    <Input
      value={value}
      className="smart-input"
      placeholder="> Input and Press <Enter>"
      prefix={<SearchOutlined />}
      onKeyPress={handleKeyPress}
      onChange={handleChange}
    />
  );
};

export default SmartInput;
