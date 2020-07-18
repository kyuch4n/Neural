import React, { FC, useState } from "react";
import "./MoreIcon.scss";
import { createFromIconfontCN } from "@ant-design/icons";

const MyIcon = createFromIconfontCN({
  scriptUrl: "//at.alicdn.com/t/font_516042_6mhqfbpthq6.js",
});

const MoreIcon: FC = () => {
  let [folded, setFolded] = useState<boolean>(true);
  let handleClick = (): void => setFolded(!folded);

  return (
    <div>
      <MyIcon type={folded ? "icon-gengduo" : "icon-shouqi"} onClick={handleClick} className="icon" />
    </div>
  );
};

export default MoreIcon;
