import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { useLatest } from "@/utils/hooks/useLatest";

export type ItemKey = string | number;

export interface UseVirtualListProps {
  itemsCount: number;
  itemHeight?: (index: number) => number;
  estimateItemHeight?: (index: number) => number;
  getItemKey: (index: number) => ItemKey;
  gapHeight: number;
  overscan?: number;
  scrollingDelay?: number;
  getScrollingElement: () => HTMLElement | null;
}

function validateProps(props: UseVirtualListProps) {
  if (!props.estimateItemHeight && !props.itemHeight) {
    throw new Error(
      "Items height or its estimate value is required. Please use `estimateItemHeight` or `itemHeight`.",
    );
  }
  return !!(props.estimateItemHeight || props.itemHeight);
}

const DEFAULT_OVERSCAN = 3; // items
const DEFAULT_IS_SCROLLING_DELAY = 0; // ms
const DEFAULT_GAP = 20;

export const useVirtualList = (props: UseVirtualListProps) => {
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

  const latestData = useLatest<{
    measurementCache: typeof measurementCache;
    getItemKey: typeof getItemKey;
  }>({ measurementCache, getItemKey });

  const itemsResizeObserver = useMemo(() => {
    return new ResizeObserver((entries, observer) => {
      entries.forEach((entry) => {
        const element = entry.target;

        if (!element.isConnected) {
          observer.unobserve(element);
          return;
        }
        const indexAttribute = element.getAttribute("data-index") || "";
        const index = parseInt(indexAttribute, 10);

        if (Number.isNaN(index)) {
          console.error(
            "Dynamic elements must have a valid data-index attribute",
          );
          return;
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const { measurementCache, getItemKey } = latestData.current;
        const key = getItemKey(index);

        const height =
          entry.borderBoxSize[0].blockSize ??
          element.getBoundingClientRect().height;

        if (measurementCache[key] === height) {
          return;
        }

        setMeasurementCache((cache) => ({ ...cache, [key]: height }));
      });
    });
  }, [latestData]);

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

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const { measurementCache, getItemKey } = latestData.current;
      const key = getItemKey(index);

      itemsResizeObserver.observe(element);

      if (typeof measurementCache[key] === "number") {
        return;
      }

      const size = element.getBoundingClientRect();

      setMeasurementCache((cache) => ({ ...cache, [key]: size.height }));
    },
    [latestData, itemsResizeObserver],
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
