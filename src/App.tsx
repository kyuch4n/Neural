import React, { FC, useState, useEffect, useCallback } from "react";
import throttle from "lodash.throttle";
import SmartInput from "./components/SmartInput";
import TagList from "./components/TagList";
import TagDetail from "./components/TagDetail";
import neuralDB, { Tag } from "./utils/Database";
import { SizeType, resizeTo, shake } from "./utils/Window";
import Timer from "./utils/Timer";
import "./App.scss";

const WAIT = 500;
const timer = new Timer();

enum Symb {
  ALL = "ALL",
}

const Pattern = {
  isEmpty: (input: string) => input.trim() === ">" || input.trim() === "",
  isCreateCommand: (input: string) => input.startsWith(">"),
  isSymbolCommand: (input: string) => input.startsWith("@"),
};

const App: FC = () => {
  let [inputVal, setInputVal] = useState("");
  let [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  let [tagList, setTaglist] = useState<Array<Tag>>([]);
  timer.start(setInputVal);

  let createTag = (input: string) => {
    input = input.trim();

    if (!Pattern.isCreateCommand(input)) return;
    if (Pattern.isEmpty(input)) return;

    neuralDB.ready(async () => {
      try {
        let name = input.slice(1).trim();
        let tag: Tag = { name };
        await neuralDB.upsert_tag(tag);
        setInputVal(name);
      } catch (e) {
        shake();
        console.log(e);
      }
    });
  };

  let searchTagList = useCallback(
    throttle(
      (input: string) => {
        input = input.trim();

        switch (true) {
          case Pattern.isEmpty(input):
          case Pattern.isCreateCommand(input):
            return;
          case Pattern.isSymbolCommand(input):
            let symbol = input.slice(1).trim().toUpperCase();
            switch (symbol) {
              case Symb.ALL:
                neuralDB.ready(async () => {
                  try {
                    let result: any = await neuralDB.query_tag_by_paging(1, 10000); // 分页是这么用的
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
        }
      },
      WAIT,
      {
        leading: true,
        trailing: true,
      }
    ),
    []
  );

  useEffect(() => {
    tagList.length ? resizeTo(SizeType.MAX) : resizeTo(SizeType.MIN);
  }, [tagList]);

  useEffect(() => {
    searchTagList(inputVal);
  }, [inputVal, searchTagList]);

  let handleUpdateTag = (tag: Tag) => {
    let idx = tagList.findIndex((i: Tag) => i.id === tag.id);
    tagList[idx] = tag;

    setTaglist(tagList);
    setSelectedTag(tag);
  };

  let tagDetail = selectedTag ? (
    <TagDetail
      selectedTag={selectedTag}
      onDelete={() => {
        setInputVal("");
      }}
      onUpdate={handleUpdateTag}
    />
  ) : null;

  let resultContainer = tagList.length ? (
    <section className="result-container">
      <aside className="tag-list-container">
        <TagList tagList={tagList} selectedTag={selectedTag} onSelected={setSelectedTag} />
      </aside>

      <article className="tag-detail-container">{tagDetail}</article>
    </section>
  ) : null;

  return (
    <div className="app-container">
      <SmartInput inputVal={inputVal} onChange={setInputVal} onConfirm={createTag} />
      {resultContainer}
    </div>
  );
};

export default App;
