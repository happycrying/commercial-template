import { createBinanceClient } from "@/utils/binance/binance";
import { NextRequest, NextResponse } from "next/server";
import { RestMarketTypes } from "@binance/connector-typescript";

export type APIBinanceActionType = "exchangeInfo";
export interface IExchangeInfo {
  timezone: string;
  serverTime: number;
  rateLimits: {
    rateLimitType: string;
    interval: string;
    intervalNum: number;
    limit: number;
  }[];
  symbols: {
    symbol: string;
    baseAsset: string;
    quoteAsset: string;
    status: string;
    orderTypes: string[];
    isSpotTradingAllowed: boolean;
    isMarginTradingAllowed: boolean;
  }[];
}

export interface IPairedPrice {
  index: number;
  symbol: string;
  sell: number;
  buy: number;
  exchange: "binance" | "bybit";
}

export type IPairedPriceResponse = IPairedPrice[] | undefined;

const TICKER_PRICE_SYMBOLS_COUNT_LIMIT = 480;

export const GET = async (req: NextRequest) => {
  const client = createBinanceClient();
  const action: APIBinanceActionType = req.nextUrl.searchParams.get(
    "action",
  ) as APIBinanceActionType;

  const fetchPrice = async (tickers: string[]) => {
    if (!tickers) {
      return;
    }

    const options: RestMarketTypes.symbolPriceTickerOptions = {
      symbols: [...tickers.slice(0, TICKER_PRICE_SYMBOLS_COUNT_LIMIT)],
    };

    const result:
      | RestMarketTypes.symbolPriceTickerResponse
      | RestMarketTypes.symbolPriceTickerResponse[] =
      await client.symbolPriceTicker(options);

    return result as RestMarketTypes.symbolPriceTickerResponse[];
  };

  try {
    switch (action) {
      case "exchangeInfo": {
        const response = await client.exchangeInformation();
        const populatedResponse: IExchangeInfo = {
          timezone: response.timezone,
          serverTime: response.serverTime,
          rateLimits: response.rateLimits,
          symbols: response.symbols
            .filter((symbol) => {
              return (
                symbol.isSpotTradingAllowed &&
                (symbol.quoteAsset === "USDT" || symbol.baseAsset === "USDT")
              );
            })
            .map((symbol) => {
              return {
                symbol: symbol.symbol,
                baseAsset: symbol.baseAsset,
                quoteAsset: symbol.quoteAsset,
                status: symbol.status,
                orderTypes: symbol.orderTypes,
                isSpotTradingAllowed: symbol.isSpotTradingAllowed,
                isMarginTradingAllowed: symbol.isMarginTradingAllowed,
              };
            }),
        };

        const tickersList = populatedResponse.symbols.map((symbol) =>
          encodeURIComponent(symbol.symbol),
        );
        const prices = await fetchPrice([...new Set(tickersList)]);

        if (!prices) return NextResponse.error();

        const nonZeroPrices = prices.filter(
          (price) => parseFloat(price.price) !== 0,
        );

        const parsedFloatPrices = nonZeroPrices.map((price) => {
          return {
            symbol: price.symbol,
            price: parseFloat(price.price),
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
              exchange: "binance",
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
