# Handoff

Last updated: 2026-07-24 Asia/Taipei

## Resume Here

Configure `LINE_CHANNEL_ACCESS_TOKEN` and one or more
`LINE_TARGET_ID_<ALIAS>` Secrets, then manually run the workflow with
`dry_run=true`.

## Objective and Current Position

- Objective: zero-cost weekday Taiwan stock subscription LINE alert
- Active task: TASK-006
- Current loop phase: record

## Changes Made

- Application, tests, workflow, project context, state documents, and README added.

## Verification

- TypeScript build: passed
- Unit tests: 7 passed
- Live official-data dry run: passed
- Dry-run persistence guard: passed
- Private GitHub repository: created and `main` pushed
- Multi-recipient build and 12 tests: passed
- MOPS complete-issuance integration build and 20 tests: passed
- Strict historical dry run for 2026-07-22: both offerings evaluated; 8112
  resolved 40,000,000 new shares and qualified
- Resilient MOPS label/unit parsing and 25 tests: passed
- Strict historical dry run for 2026-07-15: three offerings evaluated and zero
  qualified, producing the expected success heartbeat
- GitHub Actions Run #4: succeeded; alias `001` received the forced 2026-07-15
  heartbeat and the privacy-safe delivery marker was persisted
- GitHub Actions Run #6: succeeded; alias `001` received the forced 2026-05-29
  alert containing two price-qualified, issuance-incomplete offerings
- Public-release safeguards added: README disclaimer and source-specific legal
  boundaries, 1,500 ms per-host request spacing, and default-disabled MOPS
  webpage automation.
- Verification: 7 test files and 27 tests passed; 2026-07-24 official-data dry
  run passed with MOPS disabled.
- Public-underwriting proxy mode removed from runtime policy, calculations,
  workflow inputs, environment configuration, tests, and README. Missing complete
  issuance data remains price-only and does not produce dilution values.
- Historical real-delivery test: Run #2 succeeded for 2026-07-22; alias `001`
  recorded as sent
- Not yet verified: GitHub-hosted execution and real LINE delivery

## Open Issues

- MOPS format changes may require parser updates; sourced overrides remain the
  fallback.
- Do not enable MOPS automation merely because the code is public or rate-limited.
  Record confirmed authorization first.
- LINE Secrets and GitHub remote require user-owned external setup.

## Working Boundaries

- No other agent owns files.
- Do not send a real LINE message or create external resources without the
  required credentials and authorization.
