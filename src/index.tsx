import React, { FC, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import SmartInput from "./components/smart-input";
import TagList from "./components/tag-list";
import TagDetail from "./components/tag-detail";
import neuralDB, { Tag } from "./utils/database";
import { SizeType, resizeTo, shake } from "./utils/window";
import Event from "./utils/event";
import Timer from "./utils/timer";
import useThrottle from "./hooks/use-throttle";
import { Symb } from "./const/base";
import "./index.scss";

const Pattern = {
  isEmpty: (input: string) => input.trim() === "",
  isCreateCommand: (input: string) => input.trim().startsWith(">"),
  isSymbolCommand: (input: string) => input.trim().startsWith("@"),
  isSearchCommand: (input: string) => /^[^>@].*$/.test(input.trim()),
};
const timer = new Timer();

const App: FC = () => {
  let [inputVal, setInputVal] = useState("");
  let [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  let [tagList, setTaglist] = useState<Array<Tag>>([]);

  const onConfirmInput = (input: string) => {
    input = input.trim();
    switch (true) {
      case Pattern.isCreateCommand(input):
        let name = input.slice(1).trim();
        if (!name) return;
        neuralDB.ready(async () => {
          try {
            await neuralDB.upsert_tag({ name });
            setInputVal(name);
          } catch (e) {
            shake();
            console.log(e);
          }
        });
        return;
      case Pattern.isSymbolCommand(input):
        let symbol = input.slice(1).trim().toUpperCase();
        switch (symbol) {
          case Symb.ALL:
            neuralDB.ready(async () => {
              try {
                let result: any = await neuralDB.query_tag_by_paging(1, 10000);
                let list = result.list;
                setTaglist(list);
                setSelectedTag(list[0] || null);
              } catch (e) {
                shake();
                console.log(e);
              }
            });
            return;
          default:
            return;
        }
      default:
        return;
    }
  };

  const onUpdateTag = (tag: Tag) => {
    let idx = tagList.findIndex((i: Tag) => i.id === tag.id);
    tagList[idx] = tag;
    setTaglist(tagList);
    setSelectedTag(tag);
  };

  const onChangeInput = useThrottle((input: string) => {
    input = input.trim();
    switch (true) {
      case Pattern.isEmpty(input):
        setTaglist([]);
        setSelectedTag(null);
        return;
      case Pattern.isSearchCommand(input):
        neuralDB.ready(async () => {
          try {
            let result: any = await neuralDB.match_tag_by_name(input);
            setTaglist(result);
            setSelectedTag(result[0] || null);
          } catch (e) {
            shake();
            console.log(e);
          }
        });
        return;
      default:
        return;
    }
  });

  useEffect(() => (tagList.length ? resizeTo(SizeType.MAX) : resizeTo(SizeType.MIN)), [tagList]);
  useEffect(() => onChangeInput(inputVal), [inputVal, onChangeInput]);
  useEffect(() => timer.start(setInputVal), []);

  return (
    <div className="app-container">
      <SmartInput inputVal={inputVal} onChange={setInputVal} onConfirm={onConfirmInput} />
      {tagList.length ? (
        <section className="result-container">
          <aside className="tag-list-container">
            <TagList tagList={tagList} selectedTag={selectedTag} onSelected={setSelectedTag} />
          </aside>
          <div className="tag-detail-container">
            {selectedTag ? (
              <TagDetail selectedTag={selectedTag} onDelete={() => setInputVal("")} onUpdate={onUpdateTag} />
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
};

Event.regist();
ReactDOM.render(<App />, document.getElementById("root"));
