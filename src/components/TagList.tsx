import React, { FC } from "react";
import List from "antd/lib/list";
import { Tag } from "../utils/Database";
import "./TagList.scss";

interface ITaglistProps {
  tagList: Array<Tag>;
  selectedTag: Tag | null;
  onSelected: Function;
}

const TagList: FC<ITaglistProps> = (taglistProps: ITaglistProps) => {
  let { tagList = [], selectedTag, onSelected } = taglistProps;
  let isSelected = (tag: Tag) => tag.id === selectedTag?.id;

  return (
    <List
      size="small"
      split={false}
      dataSource={tagList}
      renderItem={(item) => {
        return (
          <List.Item
            className={isSelected(item) ? "is-selected" : ""}
            onClick={() => onSelected(item)}
          >
            <div className="tag-list-item">{item.name}</div>
          </List.Item>
        );
      }}
    />
  );
};

export default TagList;
