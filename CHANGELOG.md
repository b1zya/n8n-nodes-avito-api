# Changelog

## 2.0.0 - 2026-05-08

Major update compared with the GitHub `master` release line (`1.0.0`).

### Breaking Changes

- The package now uses the current n8n community node layout with source files under `src/` and built entrypoints under `dist/src/...`.
- Minimum Node.js runtime is now `>=22.22`.
- Version `2.0.0` may be incompatible with n8n versions earlier than `2.12.0` because OAuth2 credential handling was fundamentally reworked.
- Recommended n8n runtime is `>=2.19.2`; this is the version line where the Authorization Code scope issue reported in [#1](https://github.com/b1zya/n8n-nodes-avito-api/issues/1) is presumed to be resolved.
- Existing Avito OAuth2 credentials may need to be recreated after upgrading.
- The published n8n node list now includes both the main `Avito` action node and the dedicated `Avito Messenger Trigger`.
- Removed old example scaffold nodes and credentials (`ExampleNode`, `HttpBin`, example credentials).

### Added

- Added Avito Messenger API support:
  - chats, chat by ID, V3 messages, voice file links;
  - text and image message sending;
  - image upload from n8n binary data;
  - message deletion, read marker, blacklist;
  - webhook subscription list, subscribe, and unsubscribe operations.
- Added `Avito Messenger Trigger` for incoming Messenger webhook V3 events with automatic subscription management.
- Added current Avito Promotion v1 API:
  - promotion services dictionary;
  - active promotion services by item IDs;
  - promotion order list and order status;
  - BBIP suggestions, forecasts, and order creation.
- Added separate `CPXPromo Legacy` resource for existing `/cpxpromo/1/*` operations.
- Added User API resource:
  - authorized user information;
  - wallet balance;
  - wallet operations history.
- Added CPA API resource:
  - balance info;
  - calls and chats by time;
  - chat by action ID;
  - phones from chats;
  - complaint creation.
- Added CallTracking API resource:
  - call by ID;
  - calls by time;
  - call recording download as binary `audio/mpeg`.
- Added Tariff API resource for current and scheduled Transport tariff information.
- Added Special Offers beta API resource:
  - availability check;
  - mailing creation;
  - mailing confirmation and payment;
  - statistics;
  - mailing tariff information.
- Added Item account spendings operation via `POST /stats/v2/accounts/{user_id}/spendings`.
- Added support for `X-Is-Employee: true` in Promotion v1 operations that may require account hierarchy access.
- Added credential scope hints for newly supported Avito APIs, including `items:apply_bbip`, `ah:access`, `special_offers:sending`, and User API scopes.
- Added Russian node creator search aliases such as `Авито`, `Авито API`, and `Авито Мессенджер`.

### Changed

- Reworked Promotion so the `Promotion` resource covers the current official Promotion v1 API, while CPXPromo remains isolated as legacy.
- Updated OAuth2 credential behavior for current n8n versions:
  - Avito token expiry on `403` is handled at credential level;
  - Authorization Code exposes an editable comma-separated `scope` field;
  - Authorization Code uses Avito `pro_users_flow=true`.
- Updated Autoload operations to match current Avito OpenAPI pagination, filters, defaults, and response hints.
- Updated Item operations to match current Avito OpenAPI defaults and validation rules.
- Updated Messenger trigger metadata so it is presented under the main `Avito` app with Actions and Triggers in n8n.
- Moved the existing Avito SVG into the package-level `icons/` directory and updated icon paths.
- Updated README in bilingual English/Russian format for the current project structure and supported APIs.
- Updated README development credits for Claude and Codex (GPT-5.5).
- Updated development tooling to `@n8n/node-cli`, ESLint 9, TypeScript 5.9, and `n8n-workflow` 2.16.

### Fixed

- Fixed Ratings answer creation to send the documented `message` field.
- Fixed Ratings reviews limit to enforce Avito's documented maximum of `50`.
- Fixed Item `getItems`, `callsStats`, `statsShallow`, analytics, and spendings parameter handling against the current OpenAPI contract.
- Fixed date-only handling so selected calendar dates are preserved when Avito expects `YYYY-MM-DD`.
- Fixed local validation for documented date range limits in User operations history and CallTracking calls.
- Fixed binary output handling for CallTracking call recordings.
- Fixed n8n output item metadata handling for JSON and binary operation results.

### Removed

- Removed obsolete root-level `nodes/` and `credentials/` implementation layout.
- Removed old gulp/rimraf build pipeline and legacy ESLint config files.
- Removed bundled Avito Autoload swagger JSON from the source tree.
