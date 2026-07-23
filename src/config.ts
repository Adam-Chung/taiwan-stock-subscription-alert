import { readFile } from "node:fs/promises";
import type { IssuanceOverride } from "./domain/types.js";
import type { EvaluationPolicy } from "./domain/calculations.js";

export function loadPolicy(): EvaluationPolicy {
  const dilutionPolicy = process.env.DILUTION_POLICY ?? "strict";
  if (dilutionPolicy !== "strict" && dilutionPolicy !== "public-offering-proxy") {
    throw new Error("DILUTION_POLICY 必須是 strict 或 public-offering-proxy");
  }
  return {
    minDiscountPercent: numericEnv("MIN_DISCOUNT_PERCENT", 20),
    minSafetyMarginPercent: numericEnv("MIN_SAFETY_MARGIN_PERCENT", 10),
    dilutionPolicy,
  };
}

export async function loadIssuanceOverrides(): Promise<
  Record<string, IssuanceOverride>
> {
  const url = new URL("../config/issuance-overrides.json", import.meta.url);
  return JSON.parse(await readFile(url, "utf8")) as Record<string, IssuanceOverride>;
}

function numericEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new Error(`${name} 必須是數字`);
  return value;
}
