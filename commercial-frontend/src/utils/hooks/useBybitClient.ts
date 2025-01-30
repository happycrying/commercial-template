"use client";

import { IPairedPrice } from "@/app/api/binance/route";
import { useCallback } from "react";

export interface APIBinanceFunctions {
  getPrices: () => Promise<IPairedPrice[] | undefined>;
}

export function useBybitClient(): APIBinanceFunctions {
  const getPrices = useCallback(async (): Promise<
    IPairedPrice[] | undefined
  > => {
    try {
      const response = await fetch("/api/bybit?action=getPrices");
      console.log("Response:", response);
      return await response.json();
    } catch (error) {
      console.error("Error fetching exchange info:", error);
    }
  }, []);

  return { getPrices };
}
