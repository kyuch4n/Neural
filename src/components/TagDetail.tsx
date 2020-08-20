import React, { FC, useState, useEffect } from "react";
import Statistic from "antd/lib/statistic";
import Input from "antd/lib/input";
import Button from "antd/lib/button";
import Divider from "antd/lib/divider";
import Popover from "antd/lib/popover";
import AntTag from "antd/lib/tag";
import Slider from "antd/lib/slider";
import {
  DeleteOutlined,
  EditOutlined,
  PlusSquareOutlined,
  CheckOutlined,
  LinkOutlined,
  CloseOutlined,
  SmileFilled,
  SmileOutlined,
  FrownOutlined,
} from "@ant-design/icons";
import neuralDB, { Tag, TagStatus } from "../utils/Database";
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

  /************************************************************************************************
   * Wikis
   ************************************************************************************************/
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

  /************************************************************************************************
   * Wikis End
   ************************************************************************************************/

  /************************************************************************************************
   * Descriptions
   ************************************************************************************************/
  let [descriptions, setDescriptions] = useState(selectedTag.descriptions || "");
  let [isEditing, setIsEditing] = useState(false);
  let [isExpired, setIsExpired] = useState(selectedTag.expires! <= Date.now());
  let [isDone, setIsDone] = useState(selectedTag.status === TagStatus.DONE);

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

  let handleDone = () => {
    neuralDB.ready(async () => {
      try {
        let tag: Tag = Object.assign({}, selectedTag, {
          status: TagStatus.DONE,
        });
        neuralDB.upsert_tag(tag);
        onUpdate(tag);
      } catch (e) {
        shake();
        console.log(e);
      }
    });
  };

  let handleDelay = (val: number) => {
    neuralDB.ready(async () => {
      try {
        let tag: Tag = Object.assign({}, selectedTag, {
          expires: Date.now() + val * 24 * 3600000,
          status: TagStatus.PENDING,
        });
        neuralDB.upsert_tag(tag);
        onUpdate(tag);
      } catch (e) {
        shake();
        console.log(e);
      }
    });
  };

  let descriptionsRow = (
    <div className="row-descriptions-expires">
      <div className="descriptions">
        <div className="descriptions-title">
          Descriptions
          <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => setIsEditing(true)} />
        </div>
        <div className="descriptions-content">
          {isEditing ? (
            <div className="descriptions-content__editing">
              <TextArea rows={4} value={descriptions} onChange={handleChangeDescriptions} />
              <Button type="primary" icon={<CheckOutlined />} size="small" onClick={handleConfirmEdit} />
              <Button type="primary" danger icon={<CloseOutlined />} size="small" onClick={handleCancelEdit} />
            </div>
          ) : (
            <div className="descriptions-content__displaying">{descriptions}</div>
          )}
        </div>
      </div>

      <div className="countdown">
        {isDone ? (
          <SmileFilled className="tag-is-done" />
        ) : (
          <div>
            <div className="countdown-title">Expires</div>
            <div className="countdown-content">
              {isExpired ? (
                <div className="countdown-button-group">
                  <Button type="primary" icon={<SmileOutlined />} size="small" onClick={handleDone} />
                  <Popover
                    content={
                      <div className="countdown-popover-content">
                        <Slider tipFormatter={(val) => `+${val}D`} min={1} max={7} tooltipVisible onAfterChange={handleDelay} />
                      </div>
                    }
                    placement="topRight"
                    trigger="click"
                  >
                    <Button type="primary" danger icon={<FrownOutlined />} size="small" />
                  </Popover>
                </div>
              ) : (
                <Countdown value={selectedTag.expires} onFinish={() => setIsExpired(true)} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  /************************************************************************************************
   * Descriptions End
   ************************************************************************************************/

  useEffect(() => {
    let { wikis = [], descriptions = "", expires, status } = selectedTag;
    setWikiUrl("");
    setWikis(wikis || []);
    setIsEditing(false);
    setDescriptions(descriptions || "");
    setIsExpired(expires! <= Date.now());
    setIsDone(status === TagStatus.DONE);
  }, [selectedTag]);

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

  return (
    <div className="tag-detail">
      <div className="tag-name">{selectedTag.name}</div>
      <Divider />

      {descriptionsRow}
      <Divider />

      {wikisRow}
      <Divider />

      <div className="row-operations">
        <Button type="primary" danger icon={<DeleteOutlined />} onClick={handleDeleteTag} size="small" />
      </div>
    </div>
  );
};

export default TagDetail;
