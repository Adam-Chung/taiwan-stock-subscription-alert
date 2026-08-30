import { fetchCapitalInfo } from "./clients/capital.js";
import { fetchMopsIssuance } from "./clients/mops-issuance.js";
import { fetchQuote } from "./clients/quotes.js";
import { fetchEndingOfferings } from "./clients/subscriptions.js";
import { evaluateOffering, type EvaluationPolicy } from "./domain/calculations.js";
import type {
  Evaluation,
  EvaluationFailure,
  IssuanceOverride,
} from "./domain/types.js";
import { buildSuccessMessage } from "./message.js";

export interface EvaluationOptions {
  policy: EvaluationPolicy;
  issuanceOverrides: Record<string, IssuanceOverride>;
  mopsFetchEnabled: boolean;
}

/** 使用共用官方資料來源評估指定日期的所有申購案件。 */
export async function evaluateSubscriptionDate(
  date: string,
  options: EvaluationOptions,
): Promise<string> {
  const offerings = await fetchEndingOfferings(date);
  const evaluated: Evaluation[] = [];
  const failures: EvaluationFailure[] = [];

  for (const offering of offerings) {
    const override = options.issuanceOverrides[offering.code];
    const [quoteResult, capitalResult, issuanceResult] =
      await Promise.allSettled([
        fetchQuote(offering),
        fetchCapitalInfo(offering.code),
        override
          ? Promise.resolve(override)
          : options.mopsFetchEnabled
            ? fetchMopsIssuance(offering)
            : Promise.resolve(undefined),
      ]);
    const capital =
      capitalResult.status === "fulfilled" ? capitalResult.value : undefined;
    const issuance =
      issuanceResult.status === "fulfilled" ? issuanceResult.value : undefined;

    if (!Number.isFinite(offering.actualUnderwritingPrice)) {
      failures.push({
        offering,
        reason: "實際承銷價尚未確定",
        ...(capital ? { capital } : {}),
        ...(issuance ? { issuance } : {}),
      });
      continue;
    }
    if (quoteResult.status === "rejected") {
      failures.push({
        offering,
        reason:
          quoteResult.reason instanceof Error
            ? quoteResult.reason.message
            : String(quoteResult.reason),
        ...(capital ? { capital } : {}),
        ...(issuance ? { issuance } : {}),
      });
      continue;
    }

    evaluated.push(
      evaluateOffering(
        offering,
        quoteResult.value,
        capital,
        issuance,
        options.policy,
      ),
    );
  }

  return buildSuccessMessage(date, evaluated, failures);
}
