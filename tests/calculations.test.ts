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
      },
    );
    expect(result.discountPercent).toBeCloseTo(40);
    expect(result.dailyChangePercent).toBeCloseTo(5.2632);
    expect(result.scalePercent).toBeCloseTo(10);
    expect(result.safetyMarginPercent).toBeCloseTo(30);
    expect(result.recommendationKind).toBe("complete");
    expect(result.recommended).toBe(true);
  });

  it("strict 模式缺少完整新增股數時仍回報價差符合", () => {
    const result = evaluateOffering(offering, quote, capital, undefined, {
      minDiscountPercent: 20,
      minSafetyMarginPercent: 10,
    });
    expect(result.recommendationKind).toBe("price-only");
    expect(result.recommended).toBe(true);
    expect(result.scalePercent).toBeUndefined();
    expect(result.safetyMarginPercent).toBeUndefined();
    expect(result.warning).toContain("缺少整次新增發行股數");
  });

  it("缺少已發行普通股數時仍回報價差符合", () => {
    const result = evaluateOffering(
      offering,
      quote,
      undefined,
      { totalNewShares: 10_000, sourceUrl: "https://example.test" },
      {
        minDiscountPercent: 20,
        minSafetyMarginPercent: 10,
      },
    );
    expect(result.recommendationKind).toBe("price-only");
    expect(result.warning).toContain("缺少已發行普通股數");
  });

  it("缺少前收仍可依目前股價評估，但不計算漲跌幅", () => {
    const result = evaluateOffering(
      offering,
      { ...quote, previousClose: undefined },
      capital,
      { totalNewShares: 10_000, sourceUrl: "https://example.test" },
      {
        minDiscountPercent: 20,
        minSafetyMarginPercent: 10,
      },
    );
    expect(result.recommendationKind).toBe("complete");
    expect(result.dailyChangePercent).toBeUndefined();
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
      },
    );
    expect(result.discountPercent).toBeCloseTo(20);
    expect(result.recommended).toBe(false);
  });
});
