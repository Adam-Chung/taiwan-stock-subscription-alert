# Tasks

| ID | Task | Status | Owner | Model tier | Dependencies | Acceptance criteria | Evidence |
|---|---|---|---|---|---|---|---|
| TASK-001 | Validate official free data sources | completed | primary agent | standard | none | Required fields are confirmed live | HTTP 200 and fields inspected |
| TASK-002 | Implement calculation and notification core | completed | primary agent | standard | Formula and message tests pass | 7 tests passed |
| TASK-003 | Implement official data and LINE clients | completed | primary agent | standard | Clients validate missing data and credentials | Build passed |
| TASK-004 | Add free scheduling and durable state | completed | primary agent | standard | Two schedules and duplicate prevention are configured | Workflow and unchanged dry-run history verified |
| TASK-005 | Complete documentation and verification | completed | primary agent | standard | README matches code; check and live dry run pass | Build and 7 tests passed; live dry run passed |
| TASK-006 | Configure GitHub and real LINE delivery | in_progress | user + primary agent | standard | Secrets exist and one test delivery succeeds | Private repository created and pushed; LINE Secrets pending |
| TASK-007 | Add dynamic multi-recipient LINE delivery | completed | primary agent | standard | Prefix loading, deduplication, independent delivery, privacy-safe state, docs, and checks pass | 12 tests, official-data dry run, and diff check passed |
| TASK-008 | Add per-stock announcement link to LINE | completed | primary agent | lower | TASK-002 | Every recommended stock contains its code in the Goodinfo `STOCK_ID` URL and checks pass | 12 tests and diff check passed |
| TASK-009 | Add safe historical-date LINE test mode | completed | primary agent | standard | none | Manual workflow can run a specified date and proxy policy without changing scheduled strict behavior | Run #2 succeeded; alias 001 delivery recorded for 2026-07-22 |
| TASK-010 | Report price-qualified stocks when issuance data is missing | completed | primary agent | standard | TASK-002 | Missing issuance/capital data preserves discount-qualified reporting; missing previous close only suppresses change; mandatory price inputs still fail closed | Build and 15 tests passed |
| TASK-011 | Revise LINE success format and resend historical test | verification | primary agent | standard | TASK-009 | Price time, spacing, issuance blanks, incomplete-stock links, README, tests, and real 2026-07-22 resend are verified | 16 tests and historical dry run passed; real resend pending |
| TASK-012 | Resolve complete new shares from MOPS | completed | primary agent | standard | TASK-002 | Match the cash-capital-increase announcement, parse total issued shares, fail closed, and retain sourced overrides | 20 tests passed; strict 2026-07-22 dry run completed both offerings and resolved 8112 at 40,000,000 shares |
| TASK-013 | Harden MOPS wording and unit parsing; resend 2026-07-15 | completed | primary agent | standard | TASK-012 | Common labels and units parse without selecting partial allocations; strict historical heartbeat is delivered | 25 tests passed; Run #4 succeeded and alias 001 delivery was recorded |
| TASK-014 | Send 2026-05-29 historical LINE test | completed | primary agent | lower | TASK-009 | Strict historical alert is evaluated and delivered | Run #6 succeeded; alias 001 delivery recorded |
| TASK-015 | Add public-release legal and access safeguards | completed | primary agent | standard | none | README has clear disclaimer and source boundaries; per-host rate limit is enforced; disallowed MOPS crawling is default-off; durable rule is recorded | 27 tests and 2026-07-24 dry run passed; documentation and controls published |
