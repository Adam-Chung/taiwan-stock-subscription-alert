import type {
  CapitalInfo,
  Evaluation,
  IssuanceOverride,
  Quote,
  SubscriptionOffering,
} from "./types.js";

export interface EvaluationPolicy {
  minDiscountPercent: number;
  minSafetyMarginPercent: number;
  dilutionPolicy: "strict" | "public-offering-proxy";
}

export function evaluateOffering(
  offering: SubscriptionOffering,
  quote: Quote,
  capital: CapitalInfo | undefined,
  issuance: IssuanceOverride | undefined,
  policy: EvaluationPolicy,
): Evaluation {
  assertPositive("實際承銷價", offering.actualUnderwritingPrice);
  assertPositive("目前股價", quote.currentPrice);

  const discountPercent =
    ((quote.currentPrice - offering.actualUnderwritingPrice) / quote.currentPrice) * 100;
  const returnOnCostPercent =
    ((quote.currentPrice - offering.actualUnderwritingPrice) /
      offering.actualUnderwritingPrice) *
    100;
  const hasPreviousClose =
    quote.previousClose !== undefined &&
    Number.isFinite(quote.previousClose) &&
    quote.previousClose > 0;
  const dailyChangeAmount = hasPreviousClose
    ? quote.currentPrice - quote.previousClose!
    : undefined;
  const dailyChangePercent = hasPreviousClose
    ? (dailyChangeAmount! / quote.previousClose!) * 100
    : undefined;

  let scalePercent: number | undefined;
  let scaleKind: Evaluation["scaleKind"];
  let warning: string | undefined;

  if (!capital) {
    warning = "缺少已發行普通股數，無法計算股數稀釋率與安全邊際";
  } else if (issuance) {
    assertPositive("已發行普通股數", capital.issuedCommonShares);
    assertPositive("整次新增發行股數", issuance.totalNewShares);
    scalePercent =
      (issuance.totalNewShares / (capital.issuedCommonShares + issuance.totalNewShares)) *
      100;
    scaleKind = "dilution";
  } else if (policy.dilutionPolicy === "public-offering-proxy") {
    assertPositive("已發行普通股數", capital.issuedCommonShares);
    assertPositive("實際公開承銷股數", offering.actualUnderwritingShares);
    scalePercent =
      (offering.actualUnderwritingShares /
        (capital.issuedCommonShares + offering.actualUnderwritingShares)) *
      100;
    scaleKind = "public-offering-proxy";
    warning = "僅取得公開申購股數，規模比是稀釋率下限，可能低估整次發行影響";
  } else {
    warning = "缺少整次新增發行股數，無法計算股數稀釋率與安全邊際";
  }

  const safetyMarginPercent =
    scalePercent === undefined ? undefined : discountPercent - scalePercent;
  const passesDiscount = discountPercent > policy.minDiscountPercent;
  const recommendationKind: Evaluation["recommendationKind"] =
    !passesDiscount
      ? "none"
      : safetyMarginPercent === undefined
        ? "price-only"
        : safetyMarginPercent > policy.minSafetyMarginPercent
          ? "complete"
          : "none";
  return {
    offering,
    quote,
    discountPercent,
    returnOnCostPercent,
    ...(dailyChangeAmount !== undefined ? { dailyChangeAmount } : {}),
    ...(dailyChangePercent !== undefined ? { dailyChangePercent } : {}),
    ...(scalePercent !== undefined ? { scalePercent } : {}),
    ...(scaleKind !== undefined ? { scaleKind } : {}),
    ...(safetyMarginPercent !== undefined ? { safetyMarginPercent } : {}),
    recommendationKind,
    recommended: recommendationKind !== "none",
    ...(warning ? { warning } : {}),
  };
}

function assertPositive(label: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label}必須是正數`);
  }
}
