import type { Market, Quote, SubscriptionOffering } from "../domain/types.js";
import { fetchJson } from "./http.js";

interface MisResponse {
  msgArray?: Array<Record<string, string>>;
}

export async function fetchQuote(offering: SubscriptionOffering): Promise<Quote> {
  const markets = marketCandidates(offering.issueMarketLabel);
  const errors: string[] = [];
  for (const market of markets) {
    try {
      const quote = await fetchMisQuote(offering.code, market);
      if (quote) return quote;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  throw new Error(
    `找不到 ${offering.code} 的可靠行情${errors.length ? `：${errors.join("；")}` : ""}`,
  );
}

async function fetchMisQuote(code: string, market: Market): Promise<Quote | undefined> {
  const exchange = market === "tse" ? "tse" : "otc";
  const url =
    `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?` +
    `ex_ch=${exchange}_${encodeURIComponent(code)}.tw&json=1&delay=0`;
  const response = await fetchJson<MisResponse>(url);
  const item = response.msgArray?.[0];
  if (!item?.c || !item.y) return undefined;

  const previousClose = parsePrice(item.y);
  const tradedPrice = parsePrice(item.z);
  const currentPrice = Number.isFinite(tradedPrice) ? tradedPrice : previousClose;
  if (!Number.isFinite(currentPrice) || !Number.isFinite(previousClose)) return undefined;

  return {
    code: item.c,
    name: item.n || code,
    market,
    currentPrice,
    previousClose,
    quotedAt: `${item.d ?? ""} ${item.t ?? ""}`.trim(),
    usedPreviousClose: !Number.isFinite(tradedPrice),
  };
}

function marketCandidates(label: string): Market[] {
  if (label.includes("上市") || label.includes("創新板")) return ["tse", "emerging"];
  if (label.includes("上櫃")) return ["otc", "emerging"];
  return ["tse", "otc", "emerging"];
}

function parsePrice(value: string | undefined): number {
  if (!value || value === "-") return Number.NaN;
  return Number(value);
}
