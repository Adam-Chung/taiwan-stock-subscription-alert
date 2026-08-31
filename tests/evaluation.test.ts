import { afterEach, expect, it, vi } from "vitest";

vi.mock("../src/clients/subscriptions.js", () => ({
  fetchEndingOfferings: vi.fn().mockResolvedValue([
    {
      code: "6967",
      name: "汎瑋材料",
      issueMarketLabel: "上櫃增資",
      subscriptionEndDate: "2026-08-31",
      actualUnderwritingPrice: 55,
      actualUnderwritingShares: 468_000,
      totalUnderwritingAmount: 25_740_000,
      allotmentDate: "2026-09-10",
      cancelled: false,
    },
  ]),
}));

vi.mock("../src/clients/quotes.js", () => ({
  fetchQuote: vi.fn().mockResolvedValue({
    code: "6967",
    name: "汎瑋材料",
    market: "otc",
    currentPrice: 73.5,
    previousClose: 73.5,
    previousPriceKind: "close",
    quotedAt: "20260831 12:27:00",
    usedPreviousClose: true,
  }),
}));

vi.mock("../src/clients/capital.js", () => ({
  fetchCapitalInfo: vi.fn().mockResolvedValue({
    code: "6967",
    issuedCommonShares: 24_904_477,
  }),
}));

vi.mock("../src/clients/mops-issuance.js", () => ({
  fetchMopsIssuance: vi
    .fn()
    .mockRejectedValue(new Error("HTTP 503：https://example.test/path?token=private")),
}));

import { evaluateSubscriptionDate } from "../src/evaluation.js";

afterEach(() => {
  vi.restoreAllMocks();
});

it("新增股數失敗時保留原股數並記錄安全化來源錯誤", async () => {
  const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);

  const message = await evaluateSubscriptionDate("2026-08-31", {
    policy: { minDiscountPercent: 20, minSafetyMarginPercent: 10 },
    issuanceOverrides: {},
    mopsFetchEnabled: true,
  });

  expect(message).toContain("原已發行普通股數：24,904,477 股");
  expect(message).toContain("本次新增股數：\n");
  expect(errorLog).toHaveBeenCalledWith(
    JSON.stringify({
      event: "official_source_failed",
      date: "2026-08-31",
      code: "6967",
      source: "issuance",
      reason: "HTTP 503：[url]",
    }),
  );
  expect(errorLog.mock.calls.flat().join(" ")).not.toContain("private");
});
