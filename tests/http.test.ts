import { afterEach, expect, it, vi } from "vitest";
import { fetchJson, postFormText } from "../src/clients/http.js";

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

it("JSON 與 MOPS 請求都禁止自動跟隨 redirect", async () => {
  const fetchMock = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(Response.json({ ok: true }))
    .mockResolvedValueOnce(new Response("ok"));
  vi.stubGlobal("fetch", fetchMock);

  await fetchJson("https://json.example/data");
  await postFormText("https://mops.example/form", { code: "6967" });

  expect(fetchMock.mock.calls[0]?.[1]).toEqual(
    expect.objectContaining({ redirect: "manual" }),
  );
  expect(fetchMock.mock.calls[1]?.[1]).toEqual(
    expect.objectContaining({ redirect: "manual" }),
  );
});

it("來源 redirect 立即失敗且不繼續消耗 subrequest", async () => {
  const fetchMock = vi
    .fn<typeof fetch>()
    .mockResolvedValue(new Response("", { status: 302 }));
  vi.stubGlobal("fetch", fetchMock);

  await expect(fetchJson("https://redirect.example/data")).rejects.toThrow(
    "HTTP 302",
  );
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it("已耗盡 subrequest 時不做無效重試", async () => {
  const fetchMock = vi
    .fn<typeof fetch>()
    .mockRejectedValue(new Error("Too many subrequests by single Worker invocation."));
  vi.stubGlobal("fetch", fetchMock);

  await expect(fetchJson("https://budget.example/data")).rejects.toThrow(
    "Too many subrequests",
  );
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
