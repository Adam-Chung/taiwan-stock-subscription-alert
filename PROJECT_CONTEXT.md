# Project Context

## Purpose

Send one personal LINE status message on Taiwan weekdays for stock public
subscriptions whose application period ends that day. The message reports current
price, previous close, daily change, underwriting discount, issuance scale, and
the configured safety-margin result.

## Confirmed Requirements

- Use only free platforms and official free data sources.
- Run Monday through Friday; Saturday and Sunday do not require a message.
- Send a success heartbeat even when no offering qualifies.
- Never present a data-source failure as "no qualifying offering".
- Use LINE Messaging API Push for every non-empty `LINE_TARGET_ID_<ALIAS>`.
- Attempt every configured recipient independently; one failure must not block
  other recipients.
- Persist recipient alias and SHA-256 fingerprint only, never the raw userId.
- Include current price and change from the previous trading day's close.
- Discount must be greater than 20%.
- Discount minus issuance-scale percentage must be greater than 10 percentage
  points.
- Do not represent public-subscription shares as the complete issuance dilution.

## Current Technical Decisions

- TypeScript on Node.js.
- Private GitHub repository and GitHub Actions free allowance.
- Two weekday schedules with a persisted daily marker to prevent duplicate LINE
  notifications.
- Strict dilution policy by default. Complete new-share counts are supplied with
  an official source URL in `config/issuance-overrides.json`.
- Credentials remain in GitHub Secrets and are never committed.
- Application recipient count is unlimited. The hosted workflow explicitly
  injects five Secret slots and can be extended when needed.

## Repository

- GitHub: https://github.com/Adam-Chung/taiwan-stock-subscription-alert
- Visibility: Private

## External Boundaries

- GitHub-hosted schedules are best-effort and can be delayed.
- TWSE MIS is used only for a private, low-volume personal alert.
- Automatic extraction of complete issuance shares from prospectuses is not yet
  implemented.
