import React, { FC, useState, useEffect } from "react";
import Statistic from "antd/lib/statistic";
import Input from "antd/lib/input";
import Button from "antd/lib/button";
import Divider from "antd/lib/divider";
import Popover from "antd/lib/popover";
import AntTag from "antd/lib/tag";
import {
  DeleteOutlined,
  EditOutlined,
  PlusSquareOutlined,
  CheckOutlined,
  LinkOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import neuralDB, { Tag } from "../utils/Database";
import { shake } from "../utils/Window";
import "./TagDetail.scss";

const { Countdown } = Statistic;
const { TextArea } = Input;

interface ITagDetailProps {
  selectedTag: Tag;
  onDelete: Function;
  onUpdate: Function;
}

const TagDetail: FC<ITagDetailProps> = (tagDetailProps: ITagDetailProps) => {
  let { selectedTag, onDelete, onUpdate } = tagDetailProps;

  let [wikis, setWikis] = useState(selectedTag.wikis || []);
  let [wikiUrl, setWikiUrl] = useState("");

  let handleChangeWikiUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWikiUrl(e.target.value);
  };

  let handleAddWiki = () => {
    neuralDB.ready(async () => {
      try {
        let _wikiUrl = wikiUrl.trim();
        if (!_wikiUrl) return;
        wikis.push(_wikiUrl);

        let tag: Tag = Object.assign({}, selectedTag, {
          wikis,
        });
        neuralDB.upsert_tag(tag);
        onUpdate(tag);
        setWikiUrl("");
      } catch (e) {
        shake();
        console.log(e);
      }
    });
  };

  let handleDeleteWiki = (wiki: string, idx: number) => {
    neuralDB.ready(async () => {
      try {
        wikis.splice(idx, 1);
        let tag: Tag = Object.assign({}, selectedTag, {
          wikis,
        });
        neuralDB.upsert_tag(tag);
        onUpdate(tag);
      } catch (e) {
        shake();
        console.log(e);
      }
    });
  };

  let handleCopyWiki = (wiki: string) => {
    window.clipboard.writeText(wiki);
  };

  let content = (
    <div className="wikis-popover-content">
      <Input value={wikiUrl} placeholder="http(s)://" onChange={handleChangeWikiUrl} />
      <Button type="primary" icon={<CheckOutlined />} size="small" onClick={handleAddWiki} />
    </div>
  );

  let wikisRow = (
    <div className="row-wikis">
      <div className="wikis-title">
        Wikis
        <Popover content={content} placement="topRight" trigger="click">
          <Button type="primary" icon={<PlusSquareOutlined />} size="small" />
        </Popover>
      </div>
      <div className="wikis-content">
        {wikis.map((wiki, idx) => (
          <AntTag
            key={idx}
            icon={<LinkOutlined />}
            color="#3b5999"
            closable
            onClose={() => handleDeleteWiki(wiki, idx)}
            onClick={() => handleCopyWiki(wiki)}
          >
            {wiki}
          </AntTag>
        ))}
      </div>
    </div>
  );

  let [descriptions, setDescriptions] = useState(selectedTag.descriptions || "");
  let [isEditing, setIsEditing] = useState(false);

  let handleChangeDescriptions = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescriptions(e.target.value);
  };

  let handleConfirmEdit = () => {
    neuralDB.ready(async () => {
      try {
        let tag: Tag = Object.assign({}, selectedTag, {
          descriptions: descriptions.trim(),
        });
        neuralDB.upsert_tag(tag);
        onUpdate(tag);
        setIsEditing(false);
      } catch (e) {
        shake();
        console.log(e);
      }
    });
  };

  let handleCancelEdit = () => {
    setDescriptions(selectedTag.descriptions || "");
    setIsEditing(false);
  };

  let descriptionsRow = (
    <div className="row-descriptions-expires">
      <div className="descriptions">
        <div className="descriptions-title">
          Descriptions
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => setIsEditing(true)}
          />
        </div>
        <div className="descriptions-content">
          {isEditing ? (
            <div className="descriptions-content__editing">
              <TextArea rows={4} value={descriptions} onChange={handleChangeDescriptions} />
              <Button
                type="primary"
                icon={<CheckOutlined />}
                size="small"
                onClick={handleConfirmEdit}
              />
              <Button
                type="primary"
                danger
                icon={<CloseOutlined />}
                size="small"
                onClick={handleCancelEdit}
              />
            </div>
          ) : (
            <div className="descriptions-content__displaying">{descriptions}</div>
          )}
        </div>
      </div>
      <Countdown className="countdown" title="Expires" value={selectedTag.expires} />
    </div>
  );

  let handleDeleteTag = () => {
    neuralDB.ready(async () => {
      try {
        let id = selectedTag.id;
        await neuralDB.delete_tag_by_id(id!);
        onDelete();
      } catch (e) {
        shake();
        console.log(e);
      }
    });
  };

  useEffect(() => {
    setWikiUrl("");
    setWikis(selectedTag.wikis || []);
    setIsEditing(false);
    setDescriptions(selectedTag.descriptions || "");
  }, [selectedTag]);

  return (
    <div className="tag-detail">
      <div className="tag-name">{selectedTag.name}</div>
      <Divider />

      {descriptionsRow}
      <Divider />

      {wikisRow}
      <Divider />

      <div className="row-operations">
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={handleDeleteTag}
          size="small"
        />
      </div>
    </div>
  );
};

export default TagDetail;
