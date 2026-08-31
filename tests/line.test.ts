import { afterEach, describe, expect, it, vi } from "vitest";
import { pushLineMessageToRecipients } from "../src/clients/line.js";
import { hashRecipientId } from "../src/recipients.js";

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.LINE_CHANNEL_ACCESS_TOKEN;
});

describe("pushLineMessageToRecipients", () => {
  it("以單次 multicast 發送所有收件者", async () => {
    process.env.LINE_CHANNEL_ACCESS_TOKEN = "test-token";
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const recipients = [
      { alias: "One", targetId: "U-1", hash: hashRecipientId("U-1") },
      { alias: "Two", targetId: "U-2", hash: hashRecipientId("U-2") },
    ];
    const outcomes = await pushLineMessageToRecipients("hello", recipients);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.line.me/v2/bot/message/multicast",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          to: ["U-1", "U-2"],
          messages: [{ type: "text", text: "hello" }],
        }),
      }),
    );
    expect(outcomes.map(({ status }) => status)).toEqual(["sent", "sent"]);
  });

  it("multicast 失敗時整批保留給備援重試且不記錄回應內容", async () => {
    process.env.LINE_CHANNEL_ACCESS_TOKEN = "test-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("U-sensitive", {
          status: 429,
          headers: { "x-line-request-id": "request-123" },
        }),
      ),
    );
    const recipients = [
      { alias: "One", targetId: "U-1", hash: hashRecipientId("U-1") },
      { alias: "Two", targetId: "U-2", hash: hashRecipientId("U-2") },
    ];

    const outcomes = await pushLineMessageToRecipients("hello", recipients);

    expect(outcomes.map(({ status }) => status)).toEqual(["failed", "failed"]);
    expect(outcomes[0]?.error).toContain("HTTP 429");
    expect(outcomes[0]?.error).toContain("request-123");
    expect(outcomes[0]?.error).not.toContain("U-sensitive");
  });
});
