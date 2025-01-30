import { Ref, useEffect, useRef, useState } from "react";
import { ICombinedPrice } from "@/components/CEX/CEXScraped";

interface IListItemProps {
  offsetTop: number;
  isScrolling?: boolean;
  height?: number;
  "data-index"?: number;
  ref?: Ref<HTMLDivElement>;
  content: Required<ICombinedPrice>;
}

export const ListItem = (props: IListItemProps) => {
  const [animate, setAnimate] = useState<boolean>(true);
  const isInitial = useRef(true);
  const baseAsset = () => {
    return props.content.symbol.replace("USDT", "");
  };

  const symbol = props.content.symbol;
  const bybitSellPrice = props.content.bybit.sell;
  const binanceSellPrice = props.content.binance.sell;
  const delta =
    bybitSellPrice > binanceSellPrice
      ? (bybitSellPrice / binanceSellPrice - 1) * 100
      : (binanceSellPrice / bybitSellPrice - 1) * 100; // %
  const deltaSign = bybitSellPrice > binanceSellPrice ? "+" : "-";
  const deltaDescription =
    bybitSellPrice > binanceSellPrice
      ? "Buy binance, sell bybit"
      : "Buy bybit, sell binance";

  useEffect(() => {
    console.log("Rendering: ", props.content.symbol);
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }

    setAnimate(true);
    const timeout = setTimeout(() => setAnimate(false), 300); // Match animation duration

    return () => clearTimeout(timeout);
  }, [delta, deltaSign, deltaDescription]);

  return (
    <div
      suppressHydrationWarning={true}
      ref={props.ref}
      key={props.content.index}
      data-index={props["data-index"]}
      className="w-[400px] break-words max-w-[400px] h-fit rounded-2xl bg-primary/50 "
      style={{
        // height: `${props.height}px`,
        position: "absolute",
        top: "0",
        transform: `translateY(${props.offsetTop}px)`,
      }}
    >
      <div>{symbol}</div>
      <>
        <div>Bybit</div>
        <div>
          1 {baseAsset()} --&gt; {bybitSellPrice} USDT
        </div>
      </>
      <>
        <div>Binance</div>
        <div>
          1 {baseAsset()} --&gt; {binanceSellPrice} USDT
        </div>
      </>
      <div
        className={`${animate ? "bg-primary opacity-50" : "bg-background"} transition-all duration-300 ease-in text-primary rounded-xl p-2`}
      >
        Delta: {deltaSign}
        {delta}% ({deltaDescription})
      </div>
    </div>
  );
};
