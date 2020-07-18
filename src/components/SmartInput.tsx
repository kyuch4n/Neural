import React, { FC } from "react";
import { Input } from "antd";
import "./SmartInput.scss";
import { SearchOutlined } from "@ant-design/icons";

const SmartInput: FC = () => {
  return <Input className="smart-input" placeholder="Search..." prefix={<SearchOutlined />} />;
};

export default SmartInput;
