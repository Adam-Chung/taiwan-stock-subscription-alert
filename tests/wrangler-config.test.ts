import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

interface WranglerConfig {
  triggers?: {
    crons?: string[];
  };
}

describe("Cloudflare Cron configuration", () => {
  /** 確保 Cloudflare 使用明確星期名稱，不再將 1-5 誤解為 Sunday-Thursday。 */
  it("平日 12:30 與 13:00 使用 MON-FRI", async () => {
    const raw = await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8");
    const config = JSON.parse(raw) as WranglerConfig;

    expect(config.triggers?.crons).toEqual([
      "30 4 * * MON-FRI",
      "0 5 * * MON-FRI",
    ]);
  });
});
