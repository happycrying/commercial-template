"use client";

import { IPairedPrice } from "@/app/api/binance/route";
import { useCallback } from "react";

export interface APIBinanceFunctions {
  exchangeInfo: () => Promise<IPairedPrice[] | undefined>;
}

export function useBinanceClient(): APIBinanceFunctions {
  const exchangeInfo = useCallback(async (): Promise<
    IPairedPrice[] | undefined
  > => {
    try {
      const response = await fetch("/api/binance?action=exchangeInfo");
      console.log("Response:", response);
      return await response.json();
    } catch (error) {
      console.error("Error fetching exchange info:", error);
    }
  }, []);

  return { exchangeInfo };
}
