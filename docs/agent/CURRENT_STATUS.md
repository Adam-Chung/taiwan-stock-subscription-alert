# Current Status

Last updated: 2026-08-31 Asia/Taipei

## Current Objective

Build and publish a zero-monthly-cost Taiwan stock subscription LINE alert.

## Current State

- Phase: verification
- Active task: TASK-020
- Owner: primary agent

## Confirmed Progress

- Official TWSE public-subscription JSON, MIS quote fields, TWSE company capital
  data, and TPEx quote data were live-checked.
- TypeScript project, domain calculations, official-data clients, LINE client,
  message formatting, and daily delivery marker are implemented.
- Current price, previous close, price change, and daily change percentage are
  included in the output.
- Dilution calculations require complete issuance data; the former public-
  offering proxy mode has been removed.
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
- Manual workflow inputs support an optional historical evaluation date.
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
- GitHub Actions Run #4 completed successfully and delivered the forced
  2026-07-15 zero-qualifier heartbeat to alias `001`; privacy-safe history records
  delivery at 2026-07-23T09:18:46.046Z.
- The 2026-05-29 strict dry run evaluated two offerings; 8033 and 6182 were
  price-qualified but explicitly marked as missing complete issuance data.
- GitHub Actions Run #6 delivered the forced 2026-05-29 alert to alias `001`;
  privacy-safe history records delivery at 2026-07-23T09:27:01.951Z.
- Public-release safety review found that TWSE terms restrict unauthorized
  automated downloads and MOPS robots.txt disallows general crawling.
- README now documents lawful-use, data-rights, investment-information, and
  no-warranty boundaries. Requests are rate-limited per host.
- Public-release safeguards passed 7 test files and 27 tests; the 2026-07-24
  official-data dry run completed successfully with MOPS disabled by default.
- Public-underwriting proxy calculations, configuration, workflow inputs,
  documentation, and tests have been removed. Incomplete issuance data remains
  clearly labelled and is never substituted.
- Proxy removal verification passed 7 test files and 26 tests. The 2026-05-29
  dry run still reported both price-qualified offerings with blank dilution and
  safety-margin fields.
- Initial-listing quote fallback now uses the government-open-data licensed TPEx
  OpenAPI instead of attempting to scrape the TPEx market webpage.
- Incomplete cases retain subscription price, public-underwriting shares,
  allotment date, market type, and a specific failure reason.
- The 2026-08-03 live dry run evaluated 7855 Hotai Leasing from its latest
  emerging-market quote and classified it as price-qualified with incomplete
  issuance data; no LINE message or delivery record was produced.
- TPEx emerging-company open data supplied 7855's issued common shares before
  the later MOPS parser expansion resolved its complete new-issuance share count.
- Quote, issued-share, and new-issuance retrieval now settle independently. A
  failed source no longer discards facts returned successfully by other sources.
- Price-qualified and incomplete-case messages display original issued common
  shares. Failure cases also display any complete new-issuance count and derive
  post-issue shares and dilution whenever both share counts are available.
- Per the user's explicit decision, MOPS lookup is now default-enabled locally
  and in GitHub Actions, with `ENABLE_MOPS_FETCH=false` retained as a stop switch.
- Initial-listing board-resolution and underwriting-price announcements are now
  candidates for complete issuance parsing. The live 7855 price announcement
  resolved 84,777,000 new shares and 30.57% dilution.
- The OTC capital source now uses TPEx `mopsfin_t187ap03_O`; the former TWSE
  path returned HTML and caused all OTC company-capital lookups to fail.
- Live 8421 verification resolved 54,817,140 original shares, 9,000,000 new
  shares, 63,817,140 post-issue shares, and 14.10% dilution. It remained
  unselected because discount was 19.12% and safety margin was 5.01 points.
- LINE summary wording now shows only today-ending, complete-match, price-only,
  and missing-data counts, followed by a shorter no-match sentence.
- Cloudflare Worker is implemented as the production scheduler and directly
  runs the shared evaluation and LINE delivery logic without GitHub Actions.
- Cloudflare Cron runs at 12:30 and 13:00 Asia/Taipei on weekdays. KV delivery
  markers make the second run recipient-safe, and 13:15 is a hard no-send
  deadline for stale subscription information.
- GitHub Actions `schedule` triggers were removed; `workflow_dispatch` remains
  available for deliberate diagnostics and historical verification.
- Cloudflare Worker and KV are deployed. The production deployment exposes only
  a health response and has active weekday Cron Triggers for 12:30 and 13:00
  Asia/Taipei.
- Cloudflare confirms encrypted `secret_text` bindings for the LINE channel
  token and recipient slots 001 through 003; secret values were never read.
- Official HTTP sources now retry once only for timeout, transport errors,
  HTTP 408/425/429, and HTTP 500-504 while respecting bounded `Retry-After`.
  Explicit access denial such as HTTP 403 is not retried.
- Source retries and final failures emit structured privacy-safe logs with only
  date, public stock code, source category, host, attempt, and sanitized reason.
  LINE credentials, recipient IDs, query parameters, and response bodies are
  excluded.
- The 2026-08-31 live diagnostic resolved 6967 with 24,904,477 original shares
  and 5,500,000 new shares. The new regression test preserves original shares
  when the new-share lookup ultimately fails.

## Evidence

- `npm run check`: 7 test files and 26 tests passed after proxy removal.
- `npm run check`: 9 test files and 30 tests passed for TASK-017.
- `npm run check`: 10 test files and 32 tests passed after partial-data
  preservation was added.
- `npm run check`: 10 test files and 36 tests passed after expanding and enabling
  the MOPS initial-listing announcement lookup.
- `npm run check`: 10 test files and 37 tests passed for the OTC capital-source
  fix and simplified LINE summary.
- `npm run check`: 11 test files and 41 tests passed for the Cloudflare Worker
  scheduler, including bundle validation, primary/backup deduplication, partial
  recipient retry, failure handling, and the 13:15 deadline.
- Worker health endpoint returned `{ service: "taiwan-stock-subscription-alert",
  ok: true }` after production deployment; Wrangler confirmed both Cron Triggers.
- `npm audit --omit=dev`: zero vulnerabilities.
- `npm run check`: Worker bundle completed and 13 test files / 44 tests passed
  after adding bounded source retries and privacy-safe failure logging.
- The 2026-08-26 live dry run completed two cases with no missing data and the
  new compact summary.
- The 2026-08-03 live dry run resolved 7855 with 192,527,928 original shares,
  84,777,000 new shares, 277,304,928 post-issue shares, and 30.57% dilution.
- The 2026-08-03 live dry run evaluated 7855 at a 95.7 latest emerging-market
  trade, 42 underwriting price, 56.11% discount, and 192,527,928 original
  issued common shares without sending LINE.
- Live official endpoints returned HTTP 200 and expected fields on 2026-07-23.
- `npm run dry-run`: successful no-offering heartbeat produced.
- `git diff --check`: passed.
- GitHub remote: `https://github.com/Adam-Chung/taiwan-stock-subscription-alert`.

## Blockers and Risks

- MOPS announcement matching now also covers initial-listing board resolutions
  and final underwriting-price titles. Its HTML and prose can still change
  without an API schema guarantee;
  unsupported wording fails closed and can use a sourced manual override.
- Per the user's explicit 2026-08-03 decision, MOPS lookup is default-enabled in
  local configuration and GitHub Actions despite the documented access risk.
  `ENABLE_MOPS_FETCH=false` remains the immediate stop control. Rate limiting and
  disclaimers do not create legal permission.
- Real LINE delivery and GitHub schedule activation require user-owned LINE
  Secrets.
- Cloudflare Free plan CPU limits require a live scheduled execution before the
  migration can be considered operationally verified.

## Next Action

Deploy the retry/logging update, then inspect the next production source failure
through the structured Cloudflare log event without exposing secrets.

## Loop Controls

- Model tier: standard
- Escalation trigger: official source schema contradiction or failed integration
- Execution mode: primary agent
- Delegation justification: none
- Retry count: 1
- Retry limit: two attempts per failing hypothesis
- Human gate: real LINE send, GitHub remote creation, or secret configuration
- Stop condition: checks and dry run pass; remaining external setup is explicit
