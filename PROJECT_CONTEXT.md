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
- For listed and OTC stocks, include current price and change from the previous
  trading day's close. For emerging stocks, clearly label the latest available
  trade and its change from the previous trading day's average.
- Include the official company industry type for complete, price-only, and
  incomplete cases whenever available; explicitly show missing industry data
  when it cannot be retrieved. Mark complete judgments with a prominent icon.
- Support first-listed-company cash capital increases such as the official
  `第一上市公司現金增資` market label.
- Cover every equity subscription market label observed in the official list
  from 2025-09-10 through 2026-09-10, including first-listed/first-OTC and
  innovation-board variants; continue excluding central government bonds.
- Discount must be greater than 20%.
- Discount minus issuance-scale percentage must be greater than 10 percentage
  points.
- Mark a fully evaluated case as `🟠 可考慮` when discount is strictly between
  10% and 20%, dilution is below 5%, and safety margin is above 10 percentage
  points.
- Omit the generic success label, allotment date, public-underwriting shares,
  and quote timestamp from LINE details.
- Do not represent public-subscription shares as the complete issuance dilution.
- If underwriting price and a usable market price produce discount above 20%,
  report the stock even when total new shares or issued common shares are
  unavailable. Label it as price-qualified with issuance data missing.
- Missing previous close only suppresses daily-change calculation. Missing both
  traded price and previous close makes the offering unevaluable, but the
  message must retain every independently available fact, including subscription
  price, public-underwriting shares, allotment date, issued common shares, and
  complete new-issuance shares. Derived share totals and dilution remain
  available whenever their required share counts are complete.

## Current Technical Decisions

- TypeScript shared by the local Node.js runner and Cloudflare Worker.
- Cloudflare Worker Free plan is the production scheduler; GitHub Actions is a
  manual diagnostic fallback only.
- Weekday Cloudflare schedules run at 12:30 and 13:00 Asia/Taipei. One daily
  Cloudflare KV state stores hashed successful recipients, LINE uses one
  multicast request per batch, and 13:15 is the hard send deadline.
- The daily KV state also records evaluation completeness. A partial 12:30
  result is reevaluated at 13:00 and is resent to all recipients only when the
  missing-case count decreases or the result becomes complete.
- Complete new-share counts are required for dilution and safety-margin
  calculations. Public-underwriting shares are never used as a proxy. Counts
  come from authorized MOPS access or sourced entries in
  `config/issuance-overrides.json`.
- Credentials remain in Cloudflare encrypted secrets or GitHub Secrets and are
  never committed.
- Application recipient count is unlimited. The hosted workflow explicitly
  injects five Secret slots and can be extended when needed.
- Third-party automated access must follow current terms, robots.txt, licenses,
  and applicable law. Requests use a conservative per-host interval.
- Emerging quotes and company capital use TPEx OpenAPI datasets listed by the
  government open-data platform under Open Government Data License 1.0; the
  application does not scrape TPEx market-page HTML.
- Listed and OTC prices use TWSE MIS directly. Initial-listing cases try their
  expected MIS market first, then use the official TPEx emerging dataset when
  the pre-listing symbol has no MIS quote.
- MOPS automated webpage access is disabled by default because its robots.txt
  disallows crawling; it may be enabled only after the operator confirms
  authorization. Sourced manual overrides remain available.

## Repository

- GitHub: https://github.com/Adam-Chung/taiwan-stock-subscription-alert
- Visibility: Private

## External Boundaries

- No external scheduler provides a 100% delivery guarantee. The primary and
  backup Cloudflare Cron runs reduce risk, while the 13:15 deadline prevents
  stale alerts.
- TWSE MIS is used only for a private, low-volume personal alert.
- MOPS announcement markup and wording are not a versioned API contract. Parsing
  therefore fails closed and reports issuance data as missing when no supported
  total-new-share wording is found.
- Repository publication does not grant rights to third-party data, authorize
  redistribution, or turn this rule-based tool into licensed investment advice.
