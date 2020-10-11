import React, { FC, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import InlineAutocomplete from "react-inline-autocomplete";
import "react-inline-autocomplete/dist/index.css";
import TagList from "./components/tag-list";
import TagDetail from "./components/tag-detail";
import neuralDB, { Tag } from "./utils/database";
import { SizeType, resizeTo } from "./utils/window";
import Event from "./utils/event";
import Timer from "./utils/timer";
import useThrottle from "./hooks/use-throttle";
import { CatchWrapper } from "./decorators/catch";
import { Symb, TagStatus } from "./const/base";
import "./index.scss";

const Pattern = {
  isEmpty: (input: string) => input.trim() === "",
  isCreateCommand: (input: string) => input.trim().startsWith(">"),
  isSymbolCommand: (input: string) => input.trim().startsWith("@"),
  isSearchCommand: (input: string) => /^[^>@].*$/.test(input.trim()),
};
const dataSource = [
  {
    text: "@all",
    value: 0,
  },
  {
    text: "@all:pending",
    value: 1,
  },
  {
    text: "@all:done",
    value: 2,
  },
];
const timer = new Timer();

const App: FC = () => {
  let [inputVal, setInputVal] = useState("");
  let [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  let [tagList, setTaglist] = useState<Array<Tag>>([]);

  const onChange = useThrottle((input: string) => {
    input = input.trim();
    switch (true) {
      case Pattern.isEmpty(input):
        setTaglist([]);
        setSelectedTag(null);
        return;
      case Pattern.isSearchCommand(input):
        CatchWrapper(async () => {
          let result: any = await neuralDB.match_tag_by_name(input);
          setTaglist(result);
          setSelectedTag(result[0] || null);
        })();
        return;
      default:
        return;
    }
  });

  const onPressEnter = CatchWrapper(async (input: string) => {
    input = input.trim();
    switch (true) {
      case Pattern.isCreateCommand(input):
        let name = input.slice(1).trim();
        if (!name) return;
        await neuralDB.upsert_tag({ name });
        setInputVal(name);
        return;
      case Pattern.isSymbolCommand(input):
        let [symbol, status] = input.slice(1).trim().toLowerCase().split(":");
        switch (symbol) {
          case Symb.ALL:
            let list = (await neuralDB.query_tag_by_status(status as TagStatus)) as Tag[];
            setTaglist(list);
            setSelectedTag(list[0] || null);
            return;
          default:
            return;
        }
      default:
        return;
    }
  });

  const onUpdateTag = (tag: Tag) => {
    let idx = tagList.findIndex((i: Tag) => i.id === tag.id);
    tagList[idx] = tag;
    setTaglist(tagList);
    setSelectedTag(tag);
  };

  const onDeleteTag = () => {
    const input = inputVal.trim();
    switch (true) {
      case Pattern.isSymbolCommand(input):
        return onPressEnter(input);
      case Pattern.isSearchCommand(input):
        return onChange(input);
      default:
        return;
    }
  };

  useEffect(() => (tagList.length ? resizeTo(SizeType.MAX) : resizeTo(SizeType.MIN)), [tagList]);
  useEffect(() => onChange(inputVal), [inputVal, onChange]);
  useEffect(() => timer.start(setInputVal), []);

  return (
    <div className="app-container">
      <InlineAutocomplete
        className="cmd-line"
        value={inputVal}
        dataSource={dataSource}
        caseSensitive={false}
        placeholder="Nice to use Neural!"
        onChange={setInputVal}
        onPressEnter={onPressEnter}
      ></InlineAutocomplete>
      {tagList.length ? (
        <section className="result-container">
          <aside className="tag-list-container">
            <TagList tagList={tagList} selectedTag={selectedTag} onSelected={setSelectedTag} />
          </aside>
          <div className="tag-detail-container">
            {selectedTag ? <TagDetail selectedTag={selectedTag} onDelete={onDeleteTag} onUpdate={onUpdateTag} /> : null}
          </div>
        </section>
      ) : null}
    </div>
  );
};

neuralDB.ready(() => {
  Event.regist();
  ReactDOM.render(<App />, document.getElementById("root"));
});
