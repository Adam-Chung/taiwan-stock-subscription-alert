export async function fetchJson<T>(url: string, timeoutMs = 20_000): Promise<T> {
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
