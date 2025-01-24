"use client";

import {
  Ref,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { faker } from "@faker-js/faker/locale/ru";
const DEFAULT_OVERSCAN = 3; // items
const DEFAULT_IS_SCROLLING_DELAY = 0; // ms
const DEFAULT_GAP = 20;

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
      className="w-[400px] h-fit rounded-2xl"
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

type ItemKey = string | number;

interface UseFixedSizeListProps {
  itemsCount: number;
  itemHeight?: (index: number) => number;
  estimateItemHeight?: (index: number) => number;
  getItemKey: (index: number) => ItemKey;
  gapHeight: number;
  overscan?: number;
  scrollingDelay?: number;
  getScrollingElement: () => HTMLElement | null;
}

function validateProps(props: UseFixedSizeListProps) {
  if (!props.estimateItemHeight && !props.itemHeight) {
    throw new Error(
      "Items height or its estimate value is required. Please use `estimateItemHeight` or `itemHeight`.",
    );
  }
  return !!(props.estimateItemHeight || props.itemHeight);
}

export const useFixedSizeList = (props: UseFixedSizeListProps) => {
  validateProps(props);
  const {
    itemsCount,
    itemHeight,
    estimateItemHeight,
    getItemKey,
    gapHeight = DEFAULT_GAP,
    overscan = DEFAULT_OVERSCAN,
    scrollingDelay = DEFAULT_IS_SCROLLING_DELAY,
    getScrollingElement,
  } = props;

  const [measurementCache, setMeasurementCache] = useState<
    Record<ItemKey, number>
  >({});
  const [scrollTop, setScrollTop] = useState(0);
  const [listHeight, setListHeight] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  useLayoutEffect(() => {
    const scrollElement = getScrollingElement();
    if (scrollElement === null) return;
    const handleScroll = () => {
      const scrollElement = getScrollingElement();

      if (!scrollElement) {
        return;
      }
      const scrollTopHeight = scrollElement!.scrollTop;
      setScrollTop(scrollTopHeight);
    };

    scrollElement.addEventListener("scroll", handleScroll);

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
    };
  }, [getScrollingElement]);

  useEffect(() => {
    const scrollElement = getScrollingElement();
    if (scrollElement === null) return;
    let timeoutId: number | null = null;

    const handleIsScrolling = () => {
      setIsScrolling(true);

      if (timeoutId) window.clearTimeout(timeoutId);

      timeoutId = window.setTimeout(() => {
        setIsScrolling(false);
      }, scrollingDelay);
    };

    scrollElement.addEventListener("scroll", handleIsScrolling);

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);

      scrollElement.removeEventListener("scroll", handleIsScrolling);
    };
  }, [getScrollingElement, scrollingDelay]);

  useLayoutEffect(() => {
    const scrollElement = getScrollingElement();
    if (!scrollElement) {
      return;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return;

      const height =
        entry.borderBoxSize[0].blockSize ??
        entry?.target.getBoundingClientRect().height;

      setListHeight(height);
    });

    resizeObserver.observe(scrollElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [getScrollingElement]);

  const { virtualItems, totalHeight, allItems, startIndex, endIndex } =
    useMemo(() => {
      const getItemHeight = (index: number) => {
        if (itemHeight) return itemHeight(index);

        const key = getItemKey(index);
        if (typeof measurementCache[key] === "number")
          return measurementCache[key]!;
        return estimateItemHeight!(index);
      };

      const rangeStart = scrollTop;
      const rangeEnd = scrollTop + listHeight;

      let totalHeight = 0;
      let startIndex = -1;
      let endIndex = -1;
      const allRows = Array(itemsCount);

      for (let index = 0; index < itemsCount; index++) {
        const key = getItemKey(index);

        const row = {
          key: key,
          index: index,
          height: getItemHeight(index),
          offsetTop: totalHeight,
        };

        totalHeight += row.height + (index < itemsCount - 1 ? gapHeight : 0);
        allRows[index] = row;

        if (startIndex === -1) {
          startIndex =
            row.offsetTop + row.height > rangeStart
              ? Math.max(0, row.index - overscan)
              : -1;
        } else if (endIndex === -1) {
          endIndex =
            row.offsetTop + row.height >= rangeEnd
              ? Math.min(itemsCount - 1, row.index + overscan)
              : -1;
        }
      }

      const virtualRows = allRows.slice(startIndex, endIndex + 1);
      return {
        virtualItems: virtualRows,
        startIndex,
        endIndex,
        allItems: allRows,
        totalHeight,
      };
    }, [
      scrollTop,
      listHeight,
      itemsCount,
      itemHeight,
      getItemKey,
      measurementCache,
      estimateItemHeight,
      gapHeight,
      overscan,
    ]);

  const measureElement = useCallback(
    (element: Element | null) => {
      if (!element) return;

      const indexAttribute = element.getAttribute("data-index") || "";
      const index = parseInt(indexAttribute, 10);

      if (Number.isNaN(index)) {
        console.error(
          "Dynamic elements must have a valid data-index attribute",
        );
        return;
      }

      const size = element.getBoundingClientRect();
      const key = getItemKey(index);

      setMeasurementCache((cache) => ({ ...cache, [key]: size.height }));
    },
    [getItemKey],
  );

  return {
    virtualItems,
    startIndex,
    endIndex,
    totalHeight,
    isScrolling,
    allItems,
    measureElement,
  };
};

const TOTAL_LIST = Array.from({ length: 100000 }).map((_, i) => {
  return { key: i, text: faker.lorem.text() };
});

export const VirtualList = () => {
  const divContainerRef = useRef<HTMLDivElement>(null);

  const { virtualItems, totalHeight, isScrolling, measureElement } =
    useFixedSizeList({
      itemsCount: TOTAL_LIST.length,
      // itemHeight: () => 100,
      estimateItemHeight: () => 200,
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
