import type { CapitalInfo } from "../domain/types.js";
import { fetchJson } from "./http.js";

type CompanyRow = Record<string, string>;

const ENDPOINTS = [
  "https://openapi.twse.com.tw/v1/opendata/t187ap03_L",
  "https://www.tpex.org.tw/openapi/v1/mopsfin_t187ap03_O",
  "https://openapi.twse.com.tw/v1/opendata/t187ap03_P",
  "https://www.tpex.org.tw/openapi/v1/mopsfin_t187ap03_R",
];

const INDUSTRY_NAMES: Readonly<Record<string, string>> = {
  "01": "水泥工業",
  "02": "食品工業",
  "03": "塑膠工業",
  "04": "紡織纖維",
  "05": "電機機械",
  "06": "電器電纜",
  "08": "玻璃陶瓷",
  "09": "造紙工業",
  "10": "鋼鐵工業",
  "11": "橡膠工業",
  "12": "汽車工業",
  "14": "建材營造",
  "15": "航運業",
  "16": "觀光餐旅",
  "17": "金融保險",
  "18": "貿易百貨",
  "19": "綜合",
  "20": "其他",
  "21": "化學工業",
  "22": "生技醫療",
  "23": "油電燃氣",
  "24": "半導體業",
  "25": "電腦及週邊設備業",
  "26": "光電業",
  "27": "通信網路業",
  "28": "電子零組件業",
  "29": "電子通路業",
  "30": "資訊服務業",
  "31": "其他電子業",
  "32": "文化創意業",
  "33": "農業科技業",
  "34": "電子商務",
  "35": "綠能環保",
  "36": "數位雲端",
  "37": "運動休閒",
  "38": "居家生活",
};

let companyCache: CompanyRow[] | undefined;

/** 從上市、上櫃、公開發行及興櫃公司開放資料取得已發行普通股數與產業類型。 */
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
  const industryType = formatIndustryType(
    row["產業別"] ?? row.SecuritiesIndustryCode,
  );
  return {
    code,
    issuedCommonShares,
    ...(industryType ? { industryType } : {}),
  };
}

/** 將官方產業代碼轉為可讀名稱；未知代碼仍保留原始值，避免隱藏已取得的資料。 */
function formatIndustryType(value: string | undefined): string | undefined {
  const code = value?.trim().padStart(2, "0");
  if (!code) return undefined;
  const name = INDUSTRY_NAMES[code];
  return name ? `${name}（${code}）` : `產業代碼 ${code}`;
}
