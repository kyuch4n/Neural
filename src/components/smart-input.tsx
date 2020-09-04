import React, { FC } from "react";
import Input from "antd/lib/input";
import { SearchOutlined } from "@ant-design/icons";
import "./smart-input.scss";

interface ISmartInputProps {
  inputVal: string;
  onChange: any;
  onConfirm: any;
}

const SmartInput: FC<ISmartInputProps> = (smartInputProps: ISmartInputProps) => {
  let { inputVal, onChange, onConfirm } = smartInputProps;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
