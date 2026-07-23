import { gregorianYearToRoc, rocDateToIso } from "../lib/date.js";
import type { SubscriptionOffering } from "../domain/types.js";
import { fetchJson } from "./http.js";

interface PublicFormResponse {
  stat: string;
  fields: string[];
  data: string[][];
}

const SUPPORTED_MARKETS = new Set([
  "上市增資",
  "上櫃增資",
  "初上市",
  "初上櫃",
  "創新板初上市",
]);

export async function fetchEndingOfferings(
  isoDate: string,
): Promise<SubscriptionOffering[]> {
  const year = Number(isoDate.slice(0, 4));
  const url = `https://www.twse.com.tw/announcement/publicForm?response=json&yy=${year}`;
  const response = await fetchJson<PublicFormResponse>(url);
  if (response.stat !== "OK") throw new Error(`公開申購資料狀態異常：${response.stat}`);

  return response.data
    .map(parseRow)
    .filter(
      (offering) =>
        offering.subscriptionEndDate === isoDate &&
        !offering.cancelled &&
        SUPPORTED_MARKETS.has(offering.issueMarketLabel),
    );
}

function parseRow(row: string[]): SubscriptionOffering {
  const get = (index: number): string => row[index]?.trim() ?? "";
  const actualPrice = parseNumber(get(10));
  return {
    code: get(3),
    name: get(2),
    issueMarketLabel: get(4),
    subscriptionEndDate: rocDateToIso(get(6)),
    actualUnderwritingPrice: actualPrice,
    actualUnderwritingShares: parseNumber(get(8)),
    totalUnderwritingAmount: parseNumber(get(14)),
    cancelled: get(17) !== "",
  };
}

function parseNumber(value: string): number {
  if (!value || value === "---" || value === "未訂出") return Number.NaN;
  return Number(value.replaceAll(",", ""));
}

export function currentRocYear(now = new Date()): number {
  return gregorianYearToRoc(now.getUTCFullYear());
}
