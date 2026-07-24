import { fetchCapitalInfo } from "./clients/capital.js";
import { pushLineMessageToRecipients } from "./clients/line.js";
import { fetchMopsIssuance } from "./clients/mops-issuance.js";
import { fetchQuote } from "./clients/quotes.js";
import { fetchEndingOfferings } from "./clients/subscriptions.js";
import {
  isMopsFetchEnabled,
  loadIssuanceOverrides,
  loadPolicy,
} from "./config.js";
import { evaluateOffering } from "./domain/calculations.js";
import type { Evaluation, EvaluationFailure } from "./domain/types.js";
import { buildFailureMessage, buildSuccessMessage } from "./message.js";
import { loadRecipients } from "./recipients.js";
import {
  loadSentRecipientHashes,
  recordSuccessfulDeliveries,
} from "./run-history.js";

export async function run(date: string, dryRun: boolean): Promise<string> {
  const forceResend = process.env.FORCE_RESEND === "true";
  const recipients = dryRun ? [] : loadRecipients();
  const sentHashes =
    dryRun || forceResend
      ? new Set<string>()
      : await loadSentRecipientHashes(date);
  const pendingRecipients = recipients.filter(
    (recipient) => !sentHashes.has(recipient.hash),
  );
  if (!dryRun && pendingRecipients.length === 0) {
    return `今日 ${date} 已成功發送給所有設定收件者，略過重複通知。`;
  }

  let message: string;
  try {
    const offerings = await fetchEndingOfferings(date);
    const policy = loadPolicy();
    const overrides = await loadIssuanceOverrides();
    const mopsFetchEnabled = isMopsFetchEnabled();
    const evaluated: Evaluation[] = [];
    const failures: EvaluationFailure[] = [];

    for (const offering of offerings) {
      try {
        if (!Number.isFinite(offering.actualUnderwritingPrice)) {
          throw new Error("實際承銷價尚未確定");
        }
        const [quote, capital, issuance] = await Promise.all([
          fetchQuote(offering),
          fetchCapitalInfo(offering.code).catch(() => undefined),
          overrides[offering.code]
            ? Promise.resolve(overrides[offering.code])
            : mopsFetchEnabled
              ? fetchMopsIssuance(offering).catch(() => undefined)
              : Promise.resolve(undefined),
        ]);
        evaluated.push(
          evaluateOffering(offering, quote, capital, issuance, policy),
        );
      } catch (error) {
        failures.push({
          offering,
          reason: error instanceof Error ? error.message : String(error),
        });
      }
    }

    message = buildSuccessMessage(date, evaluated, failures);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    const failureMessage = buildFailureMessage(date, reason);
    if (dryRun) return failureMessage;
    const alertOutcomes = await pushLineMessageToRecipients(
      failureMessage,
      pendingRecipients,
    );
    const alertFailures = alertOutcomes.filter((outcome) => outcome.status === "failed");
    if (alertFailures.length > 0) {
      throw new Error(
        `${failureMessage}\n異常通知另有 ${alertFailures.length} 位收件者發送失敗`,
        { cause: error },
      );
    }
    throw new Error(failureMessage, { cause: error });
  }

  if (dryRun) return message;
  const outcomes = await pushLineMessageToRecipients(message, pendingRecipients);
  const successes = outcomes
    .filter((outcome) => outcome.status === "sent")
    .map((outcome) => outcome.recipient);
  await recordSuccessfulDeliveries(date, successes);
  const failed = outcomes.filter((outcome) => outcome.status === "failed");
  if (failed.length > 0) {
    throw new Error(
      `LINE 發送失敗：${failed
        .map((outcome) => `${outcome.recipient.alias} (${outcome.error})`)
        .join("；")}`,
    );
  }
  return message;
}
