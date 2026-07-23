import { fetchCapitalInfo } from "./clients/capital.js";
import { pushLineMessage } from "./clients/line.js";
import { fetchQuote } from "./clients/quotes.js";
import { fetchEndingOfferings } from "./clients/subscriptions.js";
import { loadIssuanceOverrides, loadPolicy } from "./config.js";
import { evaluateOffering } from "./domain/calculations.js";
import type { Evaluation, EvaluationFailure } from "./domain/types.js";
import { buildFailureMessage, buildSuccessMessage } from "./message.js";
import { recordRun, wasSent } from "./run-history.js";

export async function run(date: string, dryRun: boolean): Promise<string> {
  if (!dryRun && (await wasSent(date))) {
    return `今日 ${date} 已成功發送，略過重複通知。`;
  }

  try {
    const offerings = await fetchEndingOfferings(date);
    const policy = loadPolicy();
    const overrides = await loadIssuanceOverrides();
    const evaluated: Evaluation[] = [];
    const failures: EvaluationFailure[] = [];

    for (const offering of offerings) {
      try {
        if (!Number.isFinite(offering.actualUnderwritingPrice)) {
          throw new Error("實際承銷價尚未確定");
        }
        const [quote, capital] = await Promise.all([
          fetchQuote(offering),
          fetchCapitalInfo(offering.code),
        ]);
        evaluated.push(
          evaluateOffering(offering, quote, capital, overrides[offering.code], policy),
        );
      } catch (error) {
        failures.push({
          offering,
          reason: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const message = buildSuccessMessage(date, evaluated, failures);
    if (!dryRun) {
      await pushLineMessage(message);
      await recordRun(date, "sent");
    }
    return message;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    const message = buildFailureMessage(date, reason);
    if (dryRun) return message;
    await pushLineMessage(message);
    throw new Error(message, { cause: error });
  }
}
