"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IPairedPrice } from "@/app/api/binance/route";
import { useVirtualList } from "@/utils/hooks/useVirtualList";
import { useBybitClient } from "@/utils/hooks/useBybitClient";
import { useBinanceClient } from "@/utils/hooks/useBinanceClient";
import { Button } from "@/components/Button/Button";
import { ListItem } from "@/components/CEX/CEXListItems";

export interface ICombinedPrice {
  index: number;
  symbol: string;
  binance?: {
    sell: number;
    buy: number;
  };
  bybit?: {
    sell: number;
    buy: number;
  };
}

interface ICombinedPriceMap {
  [ticker: string]: ICombinedPrice;
}

export const CEXScraped = () => {
  const { getPrices } = useBybitClient();
  const [prices, setPrices] = useState<ICombinedPrice[]>([]);
  const { exchangeInfo } = useBinanceClient();

  const fetchPrices = useCallback(async (): Promise<
    ICombinedPriceMap | undefined
  > => {
    const promises = [getPrices(), exchangeInfo()];

    const map = await Promise.all(promises)
      .then((results: (IPairedPrice[] | undefined)[]) => {
        if (!results) {
          return;
        }
        const combinedPricesMap: ICombinedPriceMap = {};
        let index = 0;
        results.forEach((prices: IPairedPrice[] | undefined) => {
          if (!prices) return;
          prices.forEach((price: IPairedPrice) => {
            if (!combinedPricesMap[price.symbol]) {
              combinedPricesMap[price.symbol] = {
                index: index,
                symbol: price.symbol,
                [price.exchange]: {
                  sell: price.sell,
                  buy: price.buy,
                },
              };
              index += 1;
            } else {
              combinedPricesMap[price.symbol][price.exchange] = {
                sell: price.sell,
                buy: price.buy,
              };
            }
          });
        });
        return combinedPricesMap;
      })
      .then((combinedPricesMap) => {
        return combinedPricesMap;
      })
      .catch((err) => {
        throw err;
      });
    if (!map) return undefined;
    return map;
  }, [exchangeInfo, getPrices]);

  const updatePrices = useCallback(() => {
    fetchPrices().then((map: ICombinedPriceMap | undefined) => {
      if (!map) return;
      const combinedPrices: ICombinedPrice[] = [];
      Object.keys(map).map((key) => {
        combinedPrices.push(map[key]);
      });

      const filteredAndSortedPrices = combinedPrices
        .filter((price) => price.bybit && price.binance)
        .sort((a, b) => {
          const delta1 =
            a.bybit!.sell > a.binance!.sell
              ? (a.bybit!.sell / a.binance!.sell - 1) * 100
              : (a.binance!.sell / a.bybit!.sell - 1) * 100; // %
          const delta2 =
            b.bybit!.sell > b.binance!.sell
              ? (b.bybit!.sell / b.binance!.sell - 1) * 100
              : (b.binance!.sell / b.bybit!.sell - 1) * 100; // %
          return delta2 - delta1;
        });

      setPrices(filteredAndSortedPrices);
    });
  }, [fetchPrices]);

  const onClick = useCallback(() => {
    updatePrices();
  }, [updatePrices]);

  useEffect(() => {
    updatePrices();
  }, [updatePrices]);

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

  const renderItems = useMemo(() => {
    return virtualItems.map((_item) => {
      const realItem = prices[_item.index]!;
      return (
        <ListItem
          ref={measureElement}
          data-index={_item.index}
          content={realItem as Required<ICombinedPrice>}
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
      <div className="inline">
        <Button variant={"FILLED"} onClick={onClick}>
          Update prices
        </Button>
      </div>
      {renderList}
    </>
  );
};
