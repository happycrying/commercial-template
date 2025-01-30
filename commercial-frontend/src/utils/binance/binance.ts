import { Spot } from "@binance/connector-typescript";

const {
  NEXT_PUBLIC_BINANCE_API_KEY: API_KEY,
  NEXT_PUBLIC_BINANCE_SECRET_KEY: API_SECRET,
} = process.env;
const BASE_URL = "https://api.binance.com";

export const createBinanceClient = () => {
  if (!API_KEY || !API_SECRET || !BASE_URL) {
    throw new Error(
      "Missing Binance API configuration in environment variables.",
    );
  }

  return new Spot(API_KEY, API_SECRET, { baseURL: BASE_URL });
};
