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

export async function postFormText(
  url: string,
  form: Record<string, string>,
  timeoutMs = 20_000,
): Promise<string> {
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
