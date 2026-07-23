# Current Status

Last updated: 2026-07-23 17:17 Asia/Taipei

## Current Objective

Build and publish a zero-monthly-cost Taiwan stock subscription LINE alert.

## Current State

- Phase: record
- Active task: TASK-006
- Owner: primary agent

## Confirmed Progress

- Official TWSE public-subscription JSON, MIS quote fields, TWSE company capital
  data, and TPEx quote data were live-checked.
- TypeScript project, domain calculations, official-data clients, LINE client,
  message formatting, and daily delivery marker are implemented.
- Current price, previous close, price change, and daily change percentage are
  included in the output.
- Strict and explicitly labelled proxy issuance policies are implemented.
- Initial TypeScript build and seven tests pass.
- GitHub workflow, duplicate-safe persisted delivery marker, project context,
  state documentation, and README are complete locally.
- Live official-data dry run completed with zero ending offerings for 2026-07-23.
- Dry run was verified not to change the persisted delivery history.
- Private GitHub repository was created and local `main` was pushed to `origin`.
- LINE delivery now loads every non-empty `LINE_TARGET_ID_<ALIAS>`, rejects
  duplicate userIds, and uses independent `Promise.allSettled()` delivery.
- Per-recipient success state stores only alias, SHA-256 fingerprint, and time;
  backup execution retries only recipients not yet successful that day.
- Multi-recipient final verification and official-data dry run passed without
  changing delivery history.
- Each recommended stock now includes a Goodinfo announcement URL with its stock
  code substituted into `STOCK_ID`.
- Announcement-link verification passed with the full 12-test suite and
  `git diff --check`.
- Manual workflow inputs now support an optional historical evaluation date and
  an explicitly selected dilution policy; scheduled runs remain current-date
  strict mode.
- The 2026-07-22 official-data proxy dry run evaluated two offerings and selected
  8112 with a complete LINE message including its announcement link.
- GitHub Actions Run #2 completed successfully with `evaluation_date=2026-07-22`,
  `public-offering-proxy`, and real delivery enabled.
- Privacy-safe delivery history confirms alias `001` received the 2026-07-22
  message at 2026-07-23T08:25:14.039Z.
- Offerings with discount above 20% now remain reportable when total new shares
  or issued common shares are missing, with a `price-only` classification.
- Missing previous close no longer blocks price evaluation; it only makes daily
  change unavailable.
- LINE format revision is in progress: slash-formatted quote date, clearer
  spacing, no return-on-cost line, complete issuance fields, blank unavailable
  values, and linked incomplete-stock details.
- Manual workflow now has an explicit `force_resend` input for authorized repeat
  tests without weakening scheduled duplicate prevention.
- Revised format verification passed: 5 test files and 16 tests, 2026-07-22
  official-data dry run, and `git diff --check`.
- Complete new-share counts are now automatically resolved through the MOPS
  essence search and matching cash-capital-increase material announcement.
- The 2026-07-22 strict official-data dry run completed both offerings; 8112
  resolved 40,000,000 new shares, 565,291,698 post-issue shares, 7.08% dilution,
  and a 17.92-point safety margin.
- MOPS parsing now recognizes common total-share labels and 股/千股/仟股/萬股/
  億股 units while preferring announcement item 5 to avoid partial allocations.
- The 2026-07-15 strict dry run completed all three ending offerings and produced
  a successful zero-qualifier heartbeat.

## Evidence

- `npm run check`: 6 test files and 25 tests passed.
- Live official endpoints returned HTTP 200 and expected fields on 2026-07-23.
- `npm run dry-run`: successful no-offering heartbeat produced.
- `git diff --check`: passed.
- GitHub remote: `https://github.com/Adam-Chung/taiwan-stock-subscription-alert`.

## Blockers and Risks

- MOPS announcement HTML and prose can change without an API schema guarantee;
  unsupported wording fails closed and can use a sourced manual override.
- Real LINE delivery and GitHub schedule activation require user-owned LINE
  Secrets.

## Next Action

Publish the resilient MOPS parsing and send the authorized 2026-07-15 LINE test.

## Loop Controls

- Model tier: standard
- Escalation trigger: official source schema contradiction or failed integration
- Execution mode: primary agent
- Delegation justification: none
- Retry count: 1
- Retry limit: two attempts per failing hypothesis
- Human gate: real LINE send, GitHub remote creation, or secret configuration
- Stop condition: checks and dry run pass; remaining external setup is explicit
