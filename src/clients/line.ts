import type { LineRecipient } from "../recipients.js";

export interface DeliveryOutcome {
  recipient: LineRecipient;
  status: "sent" | "failed";
  error?: string;
}

export async function pushLineMessage(
  message: string,
  token: string,
  target: string,
): Promise<void> {
  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      to: target,
      messages: [{ type: "text", text: message }],
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`LINE Push 失敗：HTTP ${response.status} ${body.slice(0, 200)}`);
  }
}

export async function pushLineMessageToRecipients(
  message: string,
  recipients: LineRecipient[],
): Promise<DeliveryOutcome[]> {
  return pushLineMessageToRecipientsWithToken(
    message,
    recipients,
    requiredEnv("LINE_CHANNEL_ACCESS_TOKEN"),
  );
}

/** 使用明確提供的 token 對多位收件者個別發送，讓不同執行環境共用。 */
export async function pushLineMessageToRecipientsWithToken(
  message: string,
  recipients: LineRecipient[],
  token: string,
): Promise<DeliveryOutcome[]> {
  const results = await Promise.allSettled(
    recipients.map((recipient) => pushLineMessage(message, token, recipient.targetId)),
  );
  return results.map((result, index) => ({
    recipient: recipients[index]!,
    status: result.status === "fulfilled" ? "sent" : "failed",
    ...(result.status === "rejected"
      ? { error: errorMessage(result.reason) }
      : {}),
  }));
}

function errorMessage(reason: unknown): string {
  return reason instanceof Error
    ? reason.message.slice(0, 300)
    : String(reason).slice(0, 300);
}

export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`缺少環境變數 ${name}`);
  return value;
}
