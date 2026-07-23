export async function pushLineMessage(message: string): Promise<void> {
  const token = requiredEnv("LINE_CHANNEL_ACCESS_TOKEN");
  const target = requiredEnv("LINE_TARGET_ID");
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

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`缺少環境變數 ${name}`);
  return value;
}
