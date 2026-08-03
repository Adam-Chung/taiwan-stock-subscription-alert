import type { CapitalInfo } from "../domain/types.js";
import { fetchJson } from "./http.js";

type CompanyRow = Record<string, string>;

const ENDPOINTS = [
  "https://openapi.twse.com.tw/v1/opendata/t187ap03_L",
  "https://openapi.twse.com.tw/v1/opendata/t187ap03_O",
  "https://openapi.twse.com.tw/v1/opendata/t187ap03_P",
  "https://www.tpex.org.tw/openapi/v1/mopsfin_t187ap03_R",
];

let companyCache: CompanyRow[] | undefined;

/** 從上市、上櫃、公開發行及興櫃公司開放資料取得已發行普通股數。 */
export async function fetchCapitalInfo(code: string): Promise<CapitalInfo> {
  if (!companyCache) {
    const settled = await Promise.allSettled(
      ENDPOINTS.map((endpoint) => fetchJson<CompanyRow[]>(endpoint, 30_000)),
    );
    companyCache = settled.flatMap((result) =>
      result.status === "fulfilled" ? result.value : [],
    );
  }

  const row = companyCache.find(
    (item) =>
      (item["公司代號"] ?? item.SecuritiesCompanyCode)?.trim() === code,
  );
  if (!row) throw new Error(`找不到 ${code} 的公司基本資料`);
  const issuedCommonShares = Number(
    (
      row["已發行普通股數或TDR原股發行股數"] ??
      row.IssueShares ??
      ""
    ).replaceAll(",", ""),
  );
  if (!Number.isFinite(issuedCommonShares) || issuedCommonShares <= 0) {
    throw new Error(`${code} 已發行普通股數無效`);
  }
  return { code, issuedCommonShares };
}
