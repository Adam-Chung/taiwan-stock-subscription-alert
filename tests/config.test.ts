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
  it("defaults to disabled", () => {
    delete process.env.ENABLE_MOPS_FETCH;
    expect(isMopsFetchEnabled()).toBe(false);
  });

  it("requires an explicit true value", () => {
    process.env.ENABLE_MOPS_FETCH = "true";
    expect(isMopsFetchEnabled()).toBe(true);

    process.env.ENABLE_MOPS_FETCH = "TRUE";
    expect(isMopsFetchEnabled()).toBe(false);
  });
});
