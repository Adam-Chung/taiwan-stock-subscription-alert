import type { Evaluation, EvaluationFailure } from "./domain/types.js";
import { formatInteger, formatMoney, formatPercent, signed } from "./lib/format.js";

export function buildSuccessMessage(
  date: string,
  evaluated: Evaluation[],
  failures: EvaluationFailure[],
): string {
  const recommended = evaluated.filter((item) => item.recommended);
  const complete = recommended.filter(
    (item) => item.recommendationKind === "complete",
  );
  const priceOnly = recommended.filter(
    (item) => item.recommendationKind === "price-only",
  );
  const header = [
    `【台股申購提醒｜${date}】`,
    "",
    "程式執行成功",
    `今日申購截止案件：${evaluated.length + failures.length} 檔`,
    `完成評估：${evaluated.length} 檔`,
    `符合條件：${recommended.length} 檔`,
    `完整符合：${complete.length} 檔`,
    `價差符合、發行資料不足：${priceOnly.length} 檔`,
  ];

  if (recommended.length === 0) {
    header.push("", "今日沒有完整評估後符合條件的股票。");
  } else {
    for (const item of recommended) {
      const hasCompleteIssuance = item.scaleKind === "dilution";
      header.push(
        "",
        `${item.offering.code} ${item.offering.name}`,
        `判定：${
          item.recommendationKind === "complete"
            ? "完整符合"
            : "價差符合，但發行資料不足"
        }`,
        "申購截止：今天",
        "",
        `價格時間：${formatQuoteTime(item.quote.quotedAt)}`,
        `目前股價：${formatMoney(item.quote.currentPrice)} 元${
          item.quote.usedPreviousClose ? "（今日尚無成交，使用前收）" : ""
        }`,
        `前一交易日收盤價：${
          item.quote.previousClose === undefined
            ? "資料不足"
            : `${formatMoney(item.quote.previousClose)} 元`
        }`,
        `今日漲跌：${
          item.dailyChangeAmount === undefined ||
          item.dailyChangePercent === undefined
            ? "無法計算"
            : `${signed(item.dailyChangeAmount)} 元（${formatPercent(
                item.dailyChangePercent,
              )}）`
        }`,
        "",
        `實際承銷價：${formatMoney(item.offering.actualUnderwritingPrice)} 元`,
        `市價折價率：${formatPercent(item.discountPercent)}`,
        "",
        `本次新增股數：${
          item.totalNewShares === undefined
            ? ""
            : `${formatInteger(item.totalNewShares)} 股`
        }`,
        `發行後總股數：${
          item.postIssueTotalShares === undefined
            ? ""
            : `${formatInteger(item.postIssueTotalShares)} 股`
        }`,
        `股數稀釋率：${
          hasCompleteIssuance && item.scalePercent !== undefined
            ? `${item.scalePercent.toFixed(2)}%`
            : ""
        }`,
        `安全邊際：${
          hasCompleteIssuance && item.safetyMarginPercent !== undefined
            ? `${item.safetyMarginPercent.toFixed(2)} 個百分點`
            : ""
        }`,
        ...(item.warning ? [`注意：${item.warning}`] : []),
        "",
        `公告資訊：https://goodinfo.tw/tw/StockAnnounceList.asp?STOCK_ID=${encodeURIComponent(
          item.offering.code,
        )}`,
      );
    }
  }

  if (failures.length > 0) {
    header.push(
      "",
      `資料不完整：${failures.length} 檔`,
      ...failures.flatMap((item) => [
        "",
        `${item.offering.code} ${item.offering.name}`,
        `原因：${item.reason}`,
        `公告資訊：https://goodinfo.tw/tw/StockAnnounceList.asp?STOCK_ID=${encodeURIComponent(
          item.offering.code,
        )}`,
      ]),
    );
  }
  header.push("", "提醒：以上為規則篩選結果，不代表保證獲利。");
  return header.join("\n");
}

function formatQuoteTime(value: string): string {
  if (!value) return "未提供";
  const match = value.match(/^(\d{4})(\d{2})(\d{2})(.*)$/);
  return match
    ? `${match[1]}/${match[2]}/${match[3]}${match[4]}`
    : value;
}

export function buildFailureMessage(date: string, reason: string): string {
  return [
    `【台股申購提醒｜${date}｜執行異常】`,
    "",
    "今日申購資料未完成評估。",
    `原因：${reason}`,
    "系統不會將本次結果判定為「沒有標的」。",
  ].join("\n");
}
