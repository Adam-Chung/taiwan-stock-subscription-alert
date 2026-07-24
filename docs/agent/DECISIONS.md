# Decisions

## DEC-001: Free execution platform

- Date: 2026-07-23
- Status: accepted
- Context: The user requires zero monthly platform cost.
- Decision: Use GitHub Actions free allowance with early and backup weekday cron.
- Reason: It reuses an already familiar platform and the expected runtime is far
  below the free allowance.
- Consequences: Timing is best-effort, so duplicate-safe backup execution is
  required.
- Supersedes: none

## DEC-002: Do not fake complete dilution

- Date: 2026-07-23
- Status: superseded by DEC-009
- Context: The public subscription schedule exposes only public underwriting
  shares, not necessarily all newly issued shares.
- Decision: Default to strict mode and require sourced total-new-share data.
  Provide a clearly labelled opt-in lower-bound proxy for exploration.
- Reason: Using partial shares as total dilution can overstate safety margin.
- Consequences: Some offerings remain unevaluable until issuance data is supplied.
- Supersedes: none

## DEC-003: Quote semantics

- Date: 2026-07-23
- Status: accepted
- Context: The alert must show current price and daily change.
- Decision: Use the latest traded MIS price and previous close. If no trade exists,
  use previous close and label that fallback.
- Reason: A bid or ask is not an executed market price.
- Consequences: A no-trade security reports zero daily change with a warning.
- Supersedes: none

## DEC-004: Dynamic multi-recipient delivery

- Date: 2026-07-23
- Status: accepted
- Context: LINE delivery must match the established `ai-news-line-bot` model.
- Decision: Load all non-empty `LINE_TARGET_ID_<ALIAS>` variables, reject
  duplicate userIds, use independent settled delivery, and persist only aliases
  and SHA-256 fingerprints.
- Reason: Recipient count can grow without code changes, partial failures remain
  isolated, and backup execution avoids duplicate delivery.
- Consequences: GitHub Actions must explicitly inject every Repository Secret;
  five slots are included initially.
- Supersedes: single `LINE_TARGET_ID`

## DEC-005: Report price-qualified offerings with incomplete issuance data

- Date: 2026-07-23
- Status: accepted
- Context: Missing issuance or capital data should not hide a large underwriting
  discount.
- Decision: When underwriting price and usable market price establish discount
  above 20%, report the offering as `price-only` if dilution cannot be computed.
  Missing previous close only disables daily-change output.
- Reason: Price evidence remains useful while the message can explicitly avoid
  claiming that the safety-margin rule was verified.
- Consequences: LINE distinguishes `complete` from `price-only`; missing
  underwriting price or all usable market prices still fails evaluation.
- Supersedes: DEC-002 strict exclusion behavior

## DEC-006: Resolve total new shares from MOPS material announcements

- Date: 2026-07-23
- Status: accepted
- Context: The MOPS essence page links each issuer's cash-capital-increase
  material announcement, which states the complete issuance share count.
- Decision: Search MOPS by stock code, follow matching cash-capital-increase
  announcement references, parse supported total-share wording, validate the
  result against actual underwriting shares, and retain sourced overrides as a
  higher-priority fallback.
- Reason: This supplies official complete issuance data without confusing public
  subscription shares with the entire capital increase.
- Consequences: Unsupported or changed MOPS wording fails closed and is reported
  as missing issuance data.
- Supersedes: manual-only issuance lookup in DEC-002

## DEC-007: Default-disable MOPS automation for public-release safety

- Date: 2026-07-24
- Status: accepted
- Context: MOPS robots.txt disallows general automated crawling, and TWSE website
  terms restrict automated downloads without permission.
- Decision: Keep MOPS automated webpage access disabled unless the operator
  explicitly sets `ENABLE_MOPS_FETCH=true` after confirming authorization. Keep
  sourced manual overrides and incomplete-data reporting as safe fallbacks.
- Reason: A disclaimer and slower requests reduce neither contractual nor legal
  authorization requirements.
- Consequences: Without authorization or overrides, complete issuance fields may
  be unavailable and price-qualified stocks are labelled incomplete.
- Supersedes: DEC-006 always-on MOPS lookup

## DEC-008: Enforce conservative per-host request spacing

- Date: 2026-07-24
- Status: accepted
- Context: Public code should avoid concentrated automated traffic.
- Decision: Space outbound data requests by host with a 1,500 ms default and
  reject configurations below 500 ms.
- Reason: This provides a deterministic minimum load safeguard while preserving
  low-frequency daily operation.
- Consequences: Runs take slightly longer; rate limiting still does not grant
  access or redistribution rights.
- Supersedes: none

## DEC-009: Remove public-underwriting proxy calculations

- Date: 2026-07-24
- Status: accepted
- Context: The exploratory proxy mode could be misunderstood as a valid dilution
  or safety-margin calculation.
- Decision: Remove the mode, environment variable, workflow option, calculation
  branch, warning, documentation, and dedicated test. Only complete issuance
  shares may produce dilution and safety-margin values.
- Reason: One conservative rule is clearer and cannot silently understate the
  full issuance impact.
- Consequences: Missing complete issuance data remains `price-only`, with blank
  issuance and safety-margin fields.
- Supersedes: The lower-bound proxy option in DEC-002
