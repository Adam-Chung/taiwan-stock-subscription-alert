import { readFile } from "node:fs/promises";
import type { IssuanceOverride } from "./domain/types.js";
import type { EvaluationPolicy } from "./domain/calculations.js";

export function loadPolicy(): EvaluationPolicy {
  return {
    minDiscountPercent: numericEnv("MIN_DISCOUNT_PERCENT", 20),
    minSafetyMarginPercent: numericEnv("MIN_SAFETY_MARGIN_PERCENT", 10),
  };
}

export async function loadIssuanceOverrides(): Promise<
  Record<string, IssuanceOverride>
> {
  const url = new URL("../config/issuance-overrides.json", import.meta.url);
  return JSON.parse(await readFile(url, "utf8")) as Record<string, IssuanceOverride>;
}

export function isMopsFetchEnabled(): boolean {
  return process.env.ENABLE_MOPS_FETCH !== "false";
}

function numericEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new Error(`${name} 必須是數字`);
  return value;
}
