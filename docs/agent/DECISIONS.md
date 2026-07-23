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
- Status: accepted
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
