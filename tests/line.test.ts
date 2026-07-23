import { afterEach, describe, expect, it, vi } from "vitest";
import { pushLineMessageToRecipients } from "../src/clients/line.js";
import { hashRecipientId } from "../src/recipients.js";

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.LINE_CHANNEL_ACCESS_TOKEN;
});

describe("pushLineMessageToRecipients", () => {
  it("逐一嘗試所有收件者並保留部分失敗結果", async () => {
    process.env.LINE_CHANNEL_ACCESS_TOKEN = "test-token";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(new Response("bad target", { status: 400 }));
    vi.stubGlobal("fetch", fetchMock);

    const recipients = [
      { alias: "One", targetId: "U-1", hash: hashRecipientId("U-1") },
      { alias: "Two", targetId: "U-2", hash: hashRecipientId("U-2") },
    ];
    const outcomes = await pushLineMessageToRecipients("hello", recipients);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(outcomes.map(({ status }) => status)).toEqual(["sent", "failed"]);
    expect(outcomes[1]?.error).toContain("HTTP 400");
  });
});
