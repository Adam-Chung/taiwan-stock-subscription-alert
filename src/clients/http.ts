const nextRequestAtByHost = new Map<string, number>();
const DEFAULT_MIN_INTERVAL_MS = 1_500;
const MIN_ALLOWED_INTERVAL_MS = 500;

export async function fetchJson<T>(url: string, timeoutMs = 20_000): Promise<T> {
  await waitForRateLimit(url);
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "taiwan-stock-subscription-alert/0.1 personal-use",
    },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}：${url}`);
  }
  return (await response.json()) as T;
}

export async function postFormText(
  url: string,
  form: Record<string, string>,
  timeoutMs = 20_000,
): Promise<string> {
  await waitForRateLimit(url);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      accept: "text/html",
      "content-type": "application/x-www-form-urlencoded",
      referer: "https://mopsov.twse.com.tw/mops/web/t146sb05",
      "user-agent": "taiwan-stock-subscription-alert/0.1 personal-use",
    },
    body: new URLSearchParams(form),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}：${url}`);
  return response.text();
}

async function waitForRateLimit(url: string): Promise<void> {
  const configured = Number(
    process.env.HTTP_MIN_INTERVAL_MS ?? DEFAULT_MIN_INTERVAL_MS,
  );
  if (
    !Number.isFinite(configured) ||
    configured < MIN_ALLOWED_INTERVAL_MS ||
    configured > 60_000
  ) {
    throw new Error(
      `HTTP_MIN_INTERVAL_MS 必須介於 ${MIN_ALLOWED_INTERVAL_MS} 與 60000`,
    );
  }

  const host = new URL(url).host;
  const now = Date.now();
  const requestAt = Math.max(now, nextRequestAtByHost.get(host) ?? now);
  nextRequestAtByHost.set(host, requestAt + configured);
  const delayMs = requestAt - now;
  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}
