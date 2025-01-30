import { NextRequest, NextResponse } from "next/server";
import { createBybitClient } from "@/utils/bybit/bybit";
import { IPairedPrice } from "@/app/api/binance/route";

export const GET = async (req: NextRequest) => {
  const client = createBybitClient();
  const action = req.nextUrl.searchParams.get("action");

  try {
    switch (action) {
      case "getPrices": {
        const response = await client.getTickers({ category: "spot" });
        if (response.retMsg !== "OK") {
          return new NextResponse(`Invalid action ${response.retMsg}`, {
            status: 500,
          });
        }
        const prices = response.result.list;
        const usdtPairs = prices.filter((tickerInfo) =>
          tickerInfo.symbol.endsWith("USDT"),
        );

        const nonZeroPrices = usdtPairs.filter(
          (price) => parseFloat(price.lastPrice) !== 0,
        );
        console.log(
          nonZeroPrices.find((element) => element.symbol.startsWith("ZEC")),
        );

        const parsedFloatPrices = nonZeroPrices.map((price) => {
          return {
            symbol: price.symbol,
            price: parseFloat(price.lastPrice),
          };
        });

        const pairedPrices: IPairedPrice[] = parsedFloatPrices
          .sort((price1, price2) => {
            return price1.symbol < price2.symbol ? -1 : 1;
          })
          .map((price, index) => {
            return {
              index: index,
              symbol: price.symbol,
              sell: price.price,
              buy: 1 / price.price,
              exchange: "bybit",
            };
          });

        return NextResponse.json(pairedPrices);
      }

      default:
        return new NextResponse(`Invalid action ${action}`, {
          status: 400,
        });
    }
  } catch (error) {
    console.error("Error interacting with Binance API:", error);
    return new NextResponse(`${error}`, {
      status: 500,
    });
  }
};
