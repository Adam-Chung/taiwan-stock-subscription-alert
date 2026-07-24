export type Market = "tse" | "otc" | "emerging";

export interface SubscriptionOffering {
  code: string;
  name: string;
  issueMarketLabel: string;
  subscriptionEndDate: string;
  actualUnderwritingPrice: number;
  actualUnderwritingShares: number;
  totalUnderwritingAmount: number;
  cancelled: boolean;
}

export interface Quote {
  code: string;
  name: string;
  market: Market;
  currentPrice: number;
  previousClose?: number;
  quotedAt: string;
  usedPreviousClose: boolean;
}

export interface CapitalInfo {
  code: string;
  issuedCommonShares: number;
}

export interface IssuanceOverride {
  totalNewShares: number;
  sourceUrl: string;
}

export interface Evaluation {
  offering: SubscriptionOffering;
  quote: Quote;
  discountPercent: number;
  dailyChangeAmount?: number;
  dailyChangePercent?: number;
  totalNewShares?: number;
  postIssueTotalShares?: number;
  scalePercent?: number;
  scaleKind?: "dilution";
  safetyMarginPercent?: number;
  recommendationKind: "complete" | "price-only" | "none";
  recommended: boolean;
  warning?: string;
}

export interface EvaluationFailure {
  offering: SubscriptionOffering;
  reason: string;
}
