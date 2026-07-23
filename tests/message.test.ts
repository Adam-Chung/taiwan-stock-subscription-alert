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
    returnOnCostPercent: 66.666,
    dailyChangeAmount: 5,
    dailyChangePercent: 5.263,
    scalePercent: 10,
    scaleKind: "dilution",
    safetyMarginPercent: 30,
    recommended: true,
  } satisfies Evaluation;
  const message = buildSuccessMessage("2026-07-23", [item], []);
  expect(message).toContain("目前股價：100 元");
  expect(message).toContain("前一交易日收盤價：95 元");
  expect(message).toContain("今日漲跌：+5.00 元（+5.26%）");
  expect(message).toContain(
    "公告資訊：https://goodinfo.tw/tw/StockAnnounceList.asp?STOCK_ID=1234",
  );
});
