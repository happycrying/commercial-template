"use client";

import { useBinanceClient } from "@/utils/hooks/useBinanceClient";
import { Ref, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IPairedPrice, IPairedPriceResponse } from "@/app/api/binance/route";
import { useVirtualList } from "@/utils/hooks/useVirtualList";

interface IListItemProps {
  offsetTop: number;
  isScrolling?: boolean;
  height?: number;
  "data-index"?: number;
  ref?: Ref<HTMLDivElement>;
  content: IPairedPrice;
}

export const BinanceScraped = () => {
  const { exchangeInfo } = useBinanceClient();
  const [prices, setPrices] = useState<IPairedPrice[]>([]);

  const fetchExchangeInfo = async (): Promise<IPairedPriceResponse> => {
    return await exchangeInfo();
  };

  useEffect(() => {
    fetchExchangeInfo().then((result: IPairedPriceResponse) => {
      if (result) {
        setPrices(result);
      }
    });
  }, []);

  const divContainerRef = useRef<HTMLDivElement>(null);

  const { virtualItems, totalHeight, isScrolling, measureElement } =
    useVirtualList({
      itemsCount: prices.length,
      // itemHeight: () => 100,
      estimateItemHeight: () => 100,
      gapHeight: 20,
      getScrollingElement: useCallback(() => divContainerRef.current, []),
      scrollingDelay: 0,
      overscan: 3,
      getItemKey: useCallback((i: number) => i, []),
    });

  const ListItem = (props: IListItemProps) => {
    const baseAsset = () => {
      return props.content.symbol.replace("USDT", "");
    };

    return (
      <div
        suppressHydrationWarning={true}
        ref={props.ref}
        key={props.content.index}
        data-index={props["data-index"]}
        className="w-[400px] break-words max-w-[400px] h-fit rounded-2xl"
        style={{
          // height: `${props.height}px`,
          position: "absolute",
          top: "0",
          transform: `translateY(${props.offsetTop}px)`,
        }}
      >
        <div>{props.content.symbol}</div>
        <div>
          1 {baseAsset()} --&gt;{" "}
          <span className="text-red-500">{props.content.sell}</span> USDT
        </div>
        <div>
          <span className="text-green-500">
            {props.content.buy} {baseAsset()}
          </span>{" "}
          &lt;-- 1 USDT
        </div>
      </div>
    );
  };

  const renderItems = useMemo(() => {
    return virtualItems.map((_item) => {
      const realItem = prices[_item.index]!;
      return (
        <ListItem
          ref={measureElement}
          data-index={_item.index}
          content={realItem}
          key={realItem.index}
          offsetTop={_item.offsetTop}
          isScrolling={isScrolling}
        />
      );
    });
  }, [isScrolling, measureElement, prices, virtualItems]);

  const renderList = useMemo(() => {
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
          {renderItems}
        </div>
      </div>
    );
  }, [totalHeight, renderItems]);

  return (
    <>
      Binance
      {renderList}
    </>
  );
};
