import React, { FC } from "react";
import "./MoreIcon.scss";
import { createFromIconfontCN } from "@ant-design/icons";

const MyIcon = createFromIconfontCN({
  scriptUrl: "https://at.alicdn.com/t/font_516042_79bz883pgyl.js",
});

interface IMoreIconProps {
  folded: boolean;
  onClick: Function;
}

const MoreIcon: FC<IMoreIconProps> = (props: IMoreIconProps) => {
  let { folded, onClick } = props;

  return (
    <div className="more-icon-container">
      <MyIcon
        type={folded ? "icon-gengduo" : "icon-shouqi"}
        onClick={() => onClick()}
        className="icon"
      />
    </div>
  );
};

export default MoreIcon;
