import { afterEach, expect, it, vi } from "vitest";
import { fetchJson } from "../src/clients/http.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it("官方來源暫時回傳 503 時重試一次後成功", async () => {
  const fetchMock = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(new Response("", { status: 503 }))
    .mockResolvedValueOnce(Response.json({ ok: true }));
  vi.stubGlobal("fetch", fetchMock);
  const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);

  await expect(fetchJson<{ ok: boolean }>("https://retry.example/data")).resolves.toEqual({
    ok: true,
  });
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(warning).toHaveBeenCalledWith(
    JSON.stringify({
      event: "official_source_retry",
      host: "retry.example",
      nextAttempt: 2,
      reason: "HTTP 503",
    }),
  );
});

it("來源回傳不可恢復的 403 時不重試", async () => {
  const fetchMock = vi
    .fn<typeof fetch>()
    .mockResolvedValue(new Response("", { status: 403 }));
  vi.stubGlobal("fetch", fetchMock);

  await expect(fetchJson("https://blocked.example/data")).rejects.toThrow(
    "HTTP 403",
  );
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
