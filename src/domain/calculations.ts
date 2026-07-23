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
  capital: CapitalInfo,
  issuance: IssuanceOverride | undefined,
  policy: EvaluationPolicy,
): Evaluation {
  assertPositive("實際承銷價", offering.actualUnderwritingPrice);
  assertPositive("目前股價", quote.currentPrice);
  assertPositive("前一交易日收盤價", quote.previousClose);
  assertPositive("已發行普通股數", capital.issuedCommonShares);

  const discountPercent =
    ((quote.currentPrice - offering.actualUnderwritingPrice) / quote.currentPrice) * 100;
  const returnOnCostPercent =
    ((quote.currentPrice - offering.actualUnderwritingPrice) /
      offering.actualUnderwritingPrice) *
    100;
  const dailyChangeAmount = quote.currentPrice - quote.previousClose;
  const dailyChangePercent = (dailyChangeAmount / quote.previousClose) * 100;

  let scalePercent: number;
  let scaleKind: Evaluation["scaleKind"];
  let warning: string | undefined;

  if (issuance) {
    assertPositive("整次新增發行股數", issuance.totalNewShares);
    scalePercent =
      (issuance.totalNewShares / (capital.issuedCommonShares + issuance.totalNewShares)) *
      100;
    scaleKind = "dilution";
  } else if (policy.dilutionPolicy === "public-offering-proxy") {
    assertPositive("實際公開承銷股數", offering.actualUnderwritingShares);
    scalePercent =
      (offering.actualUnderwritingShares /
        (capital.issuedCommonShares + offering.actualUnderwritingShares)) *
      100;
    scaleKind = "public-offering-proxy";
    warning = "僅取得公開申購股數，規模比是稀釋率下限，可能低估整次發行影響";
  } else {
    throw new Error("缺少整次新增發行股數；strict 模式不以部分公開申購股數代替");
  }

  const safetyMarginPercent = discountPercent - scalePercent;
  return {
    offering,
    quote,
    discountPercent,
    returnOnCostPercent,
    dailyChangeAmount,
    dailyChangePercent,
    scalePercent,
    scaleKind,
    safetyMarginPercent,
    recommended:
      discountPercent > policy.minDiscountPercent &&
      safetyMarginPercent > policy.minSafetyMarginPercent,
    ...(warning ? { warning } : {}),
  };
}

function assertPositive(label: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label}必須是正數`);
  }
}
