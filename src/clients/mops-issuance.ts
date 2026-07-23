import type {
  IssuanceOverride,
  SubscriptionOffering,
} from "../domain/types.js";
import { postFormText } from "./http.js";

const MOPS_BASE = "https://mopsov.twse.com.tw";
const MOPS_SOURCE_URL = `${MOPS_BASE}/mops/web/t146sb05`;
const MOPS_ESSENCE_AJAX_URL = `${MOPS_BASE}/mops/web/ajax_t146sb05`;
const MOPS_MATERIAL_AJAX_URL = `${MOPS_BASE}/mops/web/ajax_t05st01`;

interface AnnouncementReference {
  title: string;
  year: string;
  month: string;
  sequenceNumber: string;
  spokenAt: string;
  spokenDate: string;
}

export async function fetchMopsIssuance(
  offering: SubscriptionOffering,
): Promise<IssuanceOverride> {
  const summaryHtml = await postFormText(MOPS_ESSENCE_AJAX_URL, {
    step: "1",
    firstin: "1",
    off: "1",
    keyword4: "",
    code1: "",
    TYPEK2: "",
    checkbtn: "",
    queryName: "co_id",
    inpuType: "co_id",
    TYPEK: "all",
    co_id: offering.code,
  });
  const references = parseCapitalIncreaseReferences(summaryHtml);
  const errors: string[] = [];

  for (const reference of references) {
    try {
      const detailHtml = await postFormText(MOPS_MATERIAL_AJAX_URL, {
        firstin: "true",
        co_id: offering.code,
        year: reference.year,
        month: reference.month,
        b_date: "",
        e_date: "",
        seq_no: reference.sequenceNumber,
        spoke_time: reference.spokenAt,
        spoke_date: reference.spokenDate,
        step: "2",
        TYPEK: "all",
      });
      const totalNewShares = parseTotalNewShares(detailHtml);
      if (totalNewShares < offering.actualUnderwritingShares) {
        throw new Error(
          `完整新增股數 ${totalNewShares} 小於實際公開承銷股數 ${offering.actualUnderwritingShares}`,
        );
      }
      return { totalNewShares, sourceUrl: MOPS_SOURCE_URL };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  throw new Error(
    references.length === 0
      ? `MOPS 找不到 ${offering.code} 的現金增資認股基準日公告`
      : `MOPS 現金增資公告無法解析完整新增股數：${errors.join("；")}`,
  );
}

export function parseCapitalIncreaseReferences(
  html: string,
): AnnouncementReference[] {
  const results: AnnouncementReference[] = [];
  const pattern =
    /<button[^>]*onClick="([^"]*ajax_t05st01[^"]*)"[^>]*>([\s\S]*?)<\/button>/gi;
  for (const match of html.matchAll(pattern)) {
    const script = match[1] ?? "";
    const title = htmlToText(match[2] ?? "");
    if (!title.includes("現金增資") || !title.includes("認股基準日")) continue;
    const reference = {
      title,
      year: scriptValue(script, "year"),
      month: scriptValue(script, "month"),
      sequenceNumber: scriptValue(script, "seq_no"),
      spokenAt: scriptValue(script, "spoke_time"),
      spokenDate: scriptValue(script, "spoke_date"),
    };
    if (Object.values(reference).every(Boolean)) results.push(reference);
  }
  return results;
}

export function parseTotalNewShares(html: string): number {
  const text = htmlToText(html);
  const patterns = [
    /發行總股數\s*[:：]\s*([\d,]+)\s*股/,
    /本次發行(?:總)?股數\s*[:：]\s*([\d,]+)\s*股/,
    /發行(?:普通股|新股)\s*([\d,]+)\s*股/,
  ];
  for (const pattern of patterns) {
    const value = text.match(pattern)?.[1];
    if (!value) continue;
    const shares = Number(value.replaceAll(",", ""));
    if (Number.isSafeInteger(shares) && shares > 0) return shares;
  }
  throw new Error("公告內找不到有效的發行總股數");
}

function scriptValue(script: string, field: string): string {
  return script.match(new RegExp(`fm1\\.${field}\\.value='([^']*)'`))?.[1] ?? "";
}

function htmlToText(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function decodeHtmlEntities(value: string): string {
  return value
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}
