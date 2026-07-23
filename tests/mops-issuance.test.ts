import { describe, expect, it } from "vitest";
import {
  parseCapitalIncreaseReferences,
  parseTotalNewShares,
} from "../src/clients/mops-issuance.js";

describe("MOPS issuance parsing", () => {
  it("從精華版重大訊息取得現金增資公告參數", () => {
    const html = `
      <button onClick="document.fm1.month.value='07';
        document.fm1.year.value='115';
        document.fm1.seq_no.value='1';
        document.fm1.spoke_time.value='164406';
        document.fm1.spoke_date.value='20260629';
        document.fm1.step.value='2';
        document.fm1.action='/mops/web/ajax_t05st01';">
        公告本公司訂定115年現金增資認股基準日等相關事宜
      </button>`;

    expect(parseCapitalIncreaseReferences(html)).toEqual([
      {
        title: "公告本公司訂定115年現金增資認股基準日等相關事宜",
        year: "115",
        month: "07",
        sequenceNumber: "1",
        spokenAt: "164406",
        spokenDate: "20260629",
      },
    ]);
  });

  it("從重大訊息明細解析完整發行總股數", () => {
    expect(
      parseTotalNewShares(`
        5.發行總金額及股數:<br>
        發行總股數:40,000,000股<br>
        發行總金額:400,000,000元
      `),
    ).toBe(40_000_000);
  });

  it("支援以發行普通股描述完整股數的公告", () => {
    expect(
      parseTotalNewShares(
        "5.發行總金額及股數:發行普通股35,000,000股，每股面額新台幣10元",
      ),
    ).toBe(35_000_000);
  });

  it("找不到股數時 fail closed", () => {
    expect(() => parseTotalNewShares("<p>發行股數：不適用</p>")).toThrow(
      "找不到有效",
    );
  });
});
