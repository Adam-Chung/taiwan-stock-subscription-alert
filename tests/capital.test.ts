import { afterEach, expect, it, vi } from "vitest";
import { fetchCapitalInfo } from "../src/clients/capital.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

it("可從具開放授權的興櫃公司基本資料取得已發行股數", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = String(input);
      return new Response(
        JSON.stringify(
          url.includes("mopsfin_t187ap03_R")
            ? [
                {
                  SecuritiesCompanyCode: "7855",
                  IssueShares: "192527928",
                },
              ]
            : [],
        ),
      );
    }),
  );

  await expect(fetchCapitalInfo("7855")).resolves.toEqual({
    code: "7855",
    issuedCommonShares: 192_527_928,
  });
});
