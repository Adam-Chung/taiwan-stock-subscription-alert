import { describe, expect, it } from "vitest";
import { evaluateOffering } from "../src/domain/calculations.js";
import type { CapitalInfo, Quote, SubscriptionOffering } from "../src/domain/types.js";

const offering: SubscriptionOffering = {
  code: "1234",
  name: "範例",
  issueMarketLabel: "上市增資",
  subscriptionEndDate: "2026-07-23",
  actualUnderwritingPrice: 60,
  actualUnderwritingShares: 10_000,
  totalUnderwritingAmount: 600_000,
  cancelled: false,
};
const quote: Quote = {
  code: "1234",
  name: "範例",
  market: "tse",
  currentPrice: 100,
  previousClose: 95,
  quotedAt: "20260723 10:30:00",
  usedPreviousClose: false,
};
const capital: CapitalInfo = { code: "1234", issuedCommonShares: 90_000 };

describe("evaluateOffering", () => {
  it("依使用者定義計算折價率、漲跌幅與完整稀釋率", () => {
    const result = evaluateOffering(
      offering,
      quote,
      capital,
      { totalNewShares: 10_000, sourceUrl: "https://example.test" },
      {
        minDiscountPercent: 20,
        minSafetyMarginPercent: 10,
        dilutionPolicy: "strict",
      },
    );
    expect(result.discountPercent).toBeCloseTo(40);
    expect(result.returnOnCostPercent).toBeCloseTo(66.6667);
    expect(result.dailyChangePercent).toBeCloseTo(5.2632);
    expect(result.scalePercent).toBeCloseTo(10);
    expect(result.safetyMarginPercent).toBeCloseTo(30);
    expect(result.recommended).toBe(true);
  });

  it("strict 模式缺少完整新增股數時拒絕評估", () => {
    expect(() =>
      evaluateOffering(offering, quote, capital, undefined, {
        minDiscountPercent: 20,
        minSafetyMarginPercent: 10,
        dilutionPolicy: "strict",
      }),
    ).toThrow("缺少整次新增發行股數");
  });

  it("proxy 模式清楚標示公開申購規模比只是下限", () => {
    const result = evaluateOffering(offering, quote, capital, undefined, {
      minDiscountPercent: 20,
      minSafetyMarginPercent: 10,
      dilutionPolicy: "public-offering-proxy",
    });
    expect(result.scaleKind).toBe("public-offering-proxy");
    expect(result.warning).toContain("可能低估");
  });

  it("門檻採嚴格大於而非大於等於", () => {
    const exactTwentyQuote = { ...quote, currentPrice: 75, previousClose: 75 };
    const result = evaluateOffering(
      offering,
      exactTwentyQuote,
      capital,
      { totalNewShares: 10_000, sourceUrl: "https://example.test" },
      {
        minDiscountPercent: 20,
        minSafetyMarginPercent: 0,
        dilutionPolicy: "strict",
      },
    );
    expect(result.discountPercent).toBeCloseTo(20);
    expect(result.recommended).toBe(false);
  });
});
