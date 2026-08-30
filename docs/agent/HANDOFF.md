# Handoff

Last updated: 2026-08-26 Asia/Taipei

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
  boundaries and 1,500 ms per-host request spacing.
- Verification: 7 test files and 27 tests passed; 2026-07-24 official-data dry
  run passed with MOPS disabled.
- Public-underwriting proxy mode removed from runtime policy, calculations,
  workflow inputs, environment configuration, tests, and README. Missing complete
  issuance data remains price-only and does not produce dilution values.
- Updated OTC company capital to the current TPEx OpenAPI endpoint and simplified
  the LINE summary. Live 8421 verification resolved 54,817,140 original shares,
  9,000,000 new shares, and 63,817,140 post-issue shares.
- Historical real-delivery test: Run #2 succeeded for 2026-07-22; alias `001`
  recorded as sent
- Not yet verified: GitHub-hosted execution and real LINE delivery

## Open Issues

- MOPS format changes may require parser updates; sourced overrides remain the
  fallback.
- MOPS lookup is default-enabled by explicit user decision. Do not bypass access
  denial or technical restrictions; set `ENABLE_MOPS_FETCH=false` to stop it.
- LINE Secrets and GitHub remote require user-owned external setup.
- TASK-020 Cloudflare Worker, `ALERT_HISTORY`, encrypted LINE secrets, and the
  12:30/13:00 weekday Cron Triggers are deployed. Observe the next production
  run, confirm LINE delivery and KV state, and review Worker CPU usage before
  marking the migration complete.

## Working Boundaries

- No other agent owns files.
- Do not send a real LINE message or create external resources without the
  required credentials and authorization.
