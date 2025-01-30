import { RestClientV5 } from "bybit-api";

const {
  NEXT_PUBLIC_BYBIT_API_KEY: API_KEY,
  NEXT_PUBLIC_BYBIT_SECRET_KEY: API_SECRET,
} = process.env;

export const createBybitClient = () => {
  if (!API_KEY || !API_SECRET) {
    throw new Error(
      "Missing Bybit API configuration in environment variables.",
    );
  }

  return new RestClientV5({
    key: API_KEY,
    secret: API_SECRET,
    testnet: false,
    parseAPIRateLimits: true,
  });
};
