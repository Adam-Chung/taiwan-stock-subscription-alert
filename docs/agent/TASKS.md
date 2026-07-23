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
