import { describe, expect, it } from "vitest";
import { buildSuccessMessage } from "../src/message.js";
import type { Evaluation } from "../src/domain/types.js";

it("通知包含目前股價、前收、今日漲跌幅與股票公告連結", () => {
  const item = {
    offering: {
      code: "1234",
      name: "範例",
      issueMarketLabel: "上市增資",
      subscriptionEndDate: "2026-07-23",
      actualUnderwritingPrice: 60,
      actualUnderwritingShares: 10_000,
      totalUnderwritingAmount: 600_000,
      cancelled: false,
    },
    quote: {
      code: "1234",
      name: "範例",
      market: "tse",
      currentPrice: 100,
      previousClose: 95,
      quotedAt: "20260723 10:30:00",
      usedPreviousClose: false,
    },
    discountPercent: 40,
    dailyChangeAmount: 5,
    dailyChangePercent: 5.263,
    totalNewShares: 10_000,
    postIssueTotalShares: 100_000,
    scalePercent: 10,
    scaleKind: "dilution",
    safetyMarginPercent: 30,
    recommendationKind: "complete",
    recommended: true,
  } satisfies Evaluation;
  const message = buildSuccessMessage("2026-07-23", [item], []);
  expect(message).toContain("目前股價：100 元");
  expect(message).toContain("價格時間：2026/07/23 10:30:00");
  expect(message).toContain("前一交易日收盤價：95 元");
  expect(message).toContain("今日漲跌：+5.00 元（+5.26%）");
  expect(message).not.toContain("承銷價帳面報酬率");
  expect(message).toContain("本次新增股數：10,000 股");
  expect(message).toContain("發行後總股數：100,000 股");
  expect(message).toContain("股數稀釋率：10.00%");
  expect(message).toContain("安全邊際：30.00 個百分點");
  expect(message).toContain(
    "公告資訊：https://goodinfo.tw/tw/StockAnnounceList.asp?STOCK_ID=1234",
  );
});

it("價差符合但發行資料不足時保留發行欄位空白", () => {
  const completeItem = {
    offering: {
      code: "5678",
      name: "資料不足範例",
      issueMarketLabel: "上市增資",
      subscriptionEndDate: "2026-07-23",
      actualUnderwritingPrice: 60,
      actualUnderwritingShares: 10_000,
      totalUnderwritingAmount: 600_000,
      cancelled: false,
    },
    quote: {
      code: "5678",
      name: "資料不足範例",
      market: "tse",
      currentPrice: 100,
      quotedAt: "20260723 10:30:00",
      usedPreviousClose: false,
    },
    discountPercent: 40,
    recommendationKind: "price-only",
    recommended: true,
    warning: "缺少已發行普通股數，無法計算股數稀釋率與安全邊際",
  } satisfies Evaluation;
  const message = buildSuccessMessage("2026-07-23", [completeItem], []);
  expect(message).toContain("判定：價差符合，但發行資料不足");
  expect(message).toContain("前一交易日收盤價：資料不足");
  expect(message).toContain("今日漲跌：無法計算");
  expect(message).toContain("本次新增股數：\n");
  expect(message).toContain("發行後總股數：\n");
  expect(message).toContain("股數稀釋率：\n");
  expect(message).toContain("安全邊際：\n");
});

it("資料不完整區塊包含股票代號、名稱與公告連結", () => {
  const failedOffering = {
    code: "8112",
    name: "至上",
    issueMarketLabel: "上市增資",
    subscriptionEndDate: "2026-07-22",
    actualUnderwritingPrice: 66,
    actualUnderwritingShares: 3_480_000,
    totalUnderwritingAmount: 229_680_000,
    cancelled: false,
  };
  const message = buildSuccessMessage("2026-07-22", [], [
    { offering: failedOffering, reason: "測試資料缺少" },
  ]);
  expect(message).toContain("8112 至上");
  expect(message).toContain("原因：測試資料缺少");
  expect(message).toContain(
    "公告資訊：https://goodinfo.tw/tw/StockAnnounceList.asp?STOCK_ID=8112",
  );
});
