import { afterEach, describe, expect, it } from "vitest";
import { isMopsFetchEnabled } from "../src/config.js";

const originalValue = process.env.ENABLE_MOPS_FETCH;

afterEach(() => {
  if (originalValue === undefined) {
    delete process.env.ENABLE_MOPS_FETCH;
  } else {
    process.env.ENABLE_MOPS_FETCH = originalValue;
  }
});

describe("MOPS fetch authorization gate", () => {
  it("依使用者決定預設啟用", () => {
    delete process.env.ENABLE_MOPS_FETCH;
    expect(isMopsFetchEnabled()).toBe(true);
  });

  it("可用明確的 false 停用", () => {
    process.env.ENABLE_MOPS_FETCH = "false";
    expect(isMopsFetchEnabled()).toBe(false);

    process.env.ENABLE_MOPS_FETCH = "true";
    expect(isMopsFetchEnabled()).toBe(true);
  });
});
