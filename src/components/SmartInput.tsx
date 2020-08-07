import React, { FC } from "react";
import Input from "antd/lib/input";
import { SearchOutlined } from "@ant-design/icons";
import "./SmartInput.scss";

interface ISmartInputProps {
  inputVal: string;
  onChange: any;
  onConfirm: any;
}

const SmartInput: FC<ISmartInputProps> = (smartInputProps: ISmartInputProps) => {
  let { inputVal, onChange, onConfirm } = smartInputProps;

  let handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  let handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.key === "Enter" && onConfirm(inputVal);
  };

  return (
    <Input
      value={inputVal}
      className="smart-input"
      placeholder="Search tags by name (append > to create new tag)"
      prefix={<SearchOutlined />}
      onChange={handleChange}
      onKeyPress={handleKeyPress}
    />
  );
};

export default SmartInput;
