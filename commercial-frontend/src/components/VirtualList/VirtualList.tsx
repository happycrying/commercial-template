"use client";

import { Ref, useCallback, useRef } from "react";
import { faker } from "@faker-js/faker/locale/en";
import { useVirtualList } from "@/utils/hooks/useVirtualList";

interface IListItemProps {
  offsetTop: number;
  id: string | number;
  isScrolling?: boolean;
  height?: number;
  "data-index"?: number;
  ref?: Ref<HTMLDivElement>;
  text: string;
}

const ListItem = (props: IListItemProps) => {
  return (
    <div
      suppressHydrationWarning={true}
      ref={props.ref}
      key={props.id}
      data-index={props["data-index"]}
      className="w-[400px] break-words max-w-[400px] h-fit rounded-2xl"
      style={{
        // height: `${props.height}px`,
        position: "absolute",
        top: "0",
        transform: `translateY(${props.offsetTop}px)`,
      }}
    >
      {props.text}
    </div>
  );
};

const TOTAL_LIST = Array.from({ length: 20 }).map((_, i) => {
  return { key: i, text: faker.lorem.paragraph({ min: 3, max: 6 }) };
  // return {
  //   key: i,
  //   text: "Funny text XDXDXDXDXDXDXDXDXDXDXDXDXDXDXDXDXDXDXDXDXDXDXDXDXDXDXDXDXD",
  // };
});

export const VirtualList = () => {
  const divContainerRef = useRef<HTMLDivElement>(null);

  const { virtualItems, totalHeight, isScrolling, measureElement } =
    useVirtualList({
      itemsCount: TOTAL_LIST.length,
      // itemHeight: () => 100,
      estimateItemHeight: () => 100,
      gapHeight: 20,
      getScrollingElement: useCallback(() => divContainerRef.current, []),
      scrollingDelay: 0,
      overscan: 3,
      getItemKey: useCallback((i: number) => TOTAL_LIST[i].key, []),
    });

  const renderItems = () => {
    return virtualItems.map((_item) => {
      const realItem = TOTAL_LIST[_item.index]!;
      return (
        <ListItem
          ref={measureElement}
          data-index={_item.index}
          key={realItem.key}
          id={realItem.key}
          offsetTop={_item.offsetTop}
          isScrolling={isScrolling}
          // height={_item.height}
          text={realItem.text}
        />
      );
    });
  };

  return (
    <div
      className={`w-[500px] h-[800px] overflow-y-scroll relative`}
      role={"virtualList"}
      ref={divContainerRef}
    >
      <div
        style={{ height: totalHeight }}
        className="flex flex-col w-fit"
        role={"virtualListContainer"}
      >
        {renderItems()}
      </div>
    </div>
  );
};
