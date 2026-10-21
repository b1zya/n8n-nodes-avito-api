# Changelog

## 3.1.1 - 2026-10-21

Republishes 3.1.0, which never reached npm: its publish run failed at lint because the option-order check depends on the machine's locale.

Повторный выпуск 3.1.0, которая не попала в npm: публикация упала на lint, потому что проверка порядка опций зависит от локали машины.

### English

#### Fixed

- **Release**: the `v3.1.0` publish run failed at `n8n-node lint`, before `npm publish`, so 3.1.0 was never published. Everything listed under 3.1.0 below ships in 3.1.1; when upgrading from 3.0.1, follow the 3.1.0 upgrade notes.
- **Lint**: `node-param-options-type-unsorted-items` sorts with `String#localeCompare` in the runtime's default locale. On a ru-RU machine Cyrillic names sort before Latin ones, on the en-US CI runner after them. The resource list (`CallTracking`, `CPA`) and the Promotion operations (`BBIP. …`) mix both scripts, so no order passes in both locales. They are now in en-US order, as in CI, with the rule disabled inline for these two lists only. Only their order in the UI changes.

### Русский

#### Исправлено

- **Выпуск**: публикация по тегу `v3.1.0` упала на `n8n-node lint`, до `npm publish`, поэтому 3.1.0 в npm не попала. Всё, что описано ниже в разделе 3.1.0, выходит в 3.1.1; при обновлении с 3.0.1 следуйте указаниям из 3.1.0.
- **Lint**: `node-param-options-type-unsorted-items` сортирует через `String#localeCompare` в локали системы по умолчанию. В русской локали кириллица идёт перед латиницей, на сервере CI с английской локалью — после неё. В списке ресурсов (`CallTracking`, `CPA`) и операций Продвижения (`BBIP. …`) смешаны оба алфавита, поэтому порядка, проходящего в обеих локалях, нет. Эти списки выстроены в порядке en-US, как в CI, а правило отключено только для них. Меняется лишь их порядок в интерфейсе.

## 3.1.0 - 2026-10-21 (not published to npm)

Switches Promotion to the `X-Ah-Employee-Id` header and moves the active services list to `/promotion/v2/items/services/get`, following the Avito Promotion API changes of 2026-09-29.

Продвижение переведено на заголовок `X-Ah-Employee-Id`, а список активных услуг — на `/promotion/v2/items/services/get` вслед за изменениями API Продвижения Авито от 29.09.2026.

### English

#### Upgrade Notes

- **Promotion**: the `ID Компании (X-Employee-Of)` field was replaced by `ID Сотрудника` (`X-Ah-Employee-Id`). Avito's [Promotion API](https://www.avito.ru/developers/api-catalog/promotion/documentation) now accepts only `X-Ah-Employee-Id` for requests on behalf of an employee; `X-Employee-Of` is no longer used there, so since 2026-09-29 a node configured in 3.x silently ran under the personal account.
  - The new header takes the **employee** ID, not the company ID. The old value cannot be carried over, so the field was renamed rather than reused — a stale company ID is never sent as an employee ID.
  - After upgrading, enter the `employeeId` from Account Hierarchy → `Сотрудники Иерархии` (`getEmployeesV1`) in every Promotion node that used the old field. Leave `0` to work under the personal account.
- **Promotion**: `Активные Услуги По Объявлениям` now calls [`POST /promotion/v2/items/services/get`](https://www.avito.ru/developers/api-catalog/promotion/documentation#operation/get_services_by_items_v2). The request is unchanged; the response adds a required `degraded` boolean — when `true`, the services list may be incomplete.

#### Changed

- `Словарь Типов Услуг` (`/promotion/v1/items/services/dict`) now accepts and sends the employee header too, since the specification declares it on all Promotion operations.
- Operation and resource lists are now sorted alphabetically, as the n8n linter requires. Only the order in the UI changes; values and defaults are the same.
- The Messenger trigger's source files and class were renamed from `AvitoMessengerTrigger` to `AvitoTrigger` to match the node name. The node type `avitoTrigger` is unchanged, so saved workflows keep working.
- Updated `@n8n/node-cli` from `0.45.4` to `0.54.0` (pinned: it is still tagged `beta` on npm). It brings `@n8n/eslint-plugin-community-nodes` `0.37.0`, adding `no-unsafe-connection-type-cast` and `valid-node-categories`, and `eslint-plugin-n8n-nodes-base` `2.0.0`. Also updated `prettier` from `3.9.6` to `3.9.10` and `release-it` from `20.0.1` to `21.1.1` (requires Node `^22.22.2 || ^24.15.0 || >=26`).
- The n8n-nodes-base lint rules now actually run on `src/`: `@n8n/node-cli` enables them only for `./nodes` and `./credentials`. The 23 findings they surfaced are fixed.
- Prettier now uses the `@n8n/node-cli` template config (`.prettierrc.js`) and `src` was reformatted with it. The previous config had no `singleQuote`, so `npm run format` would have switched every string to double quotes.

#### Fixed

- Errors raised inside an operation are no longer rebuilt from their message when the node rethrows them: the description and HTTP details from Avito now reach the n8n UI. Errors that do not come from the API (for example a `TypeError`) are reported as `NodeOperationError` instead of being presented as API errors.
- Codex files used the `n8n-nodes-base.` prefix reserved for built-in nodes. The node IDs are now `n8n-nodes-avito-api.avito` and `n8n-nodes-avito-api.avitoTrigger` (the trigger's ID also named the wrong node, `avitoMessengerTrigger`).

#### Deprecated

- `POST /promotion/v1/items/services/get` is deprecated by Avito and is no longer called by the node.

### Русский

#### Важно При Обновлении

- **Продвижение**: поле `ID Компании (X-Employee-Of)` заменено на `ID Сотрудника` (`X-Ah-Employee-Id`). [API Продвижения](https://www.avito.ru/developers/api-catalog/promotion/documentation) для запросов от имени сотрудника теперь принимает только `X-Ah-Employee-Id`; `X-Employee-Of` там больше не используется, поэтому с 29.09.2026 ноды, настроенные в 3.x, молча работали от личного аккаунта.
  - Новый заголовок принимает ID **сотрудника**, а не компании. Перенести старое значение нельзя, поэтому поле переименовано, а не переиспользовано — устаревший ID компании никогда не уйдёт под видом ID сотрудника.
  - После обновления укажите `employeeId` из Иерархия Аккаунтов → «Сотрудники Иерархии» (`getEmployeesV1`) во всех нодах Продвижения, где было заполнено старое поле. Оставьте `0`, чтобы работать от личного аккаунта.
- **Продвижение**: «Активные Услуги По Объявлениям» вызывает [`POST /promotion/v2/items/services/get`](https://www.avito.ru/developers/api-catalog/promotion/documentation#operation/get_services_by_items_v2). Запрос не изменился; в ответе появилось обязательное поле `degraded` — при `true` список услуг может быть неполным.

#### Изменено

- «Словарь Типов Услуг» (`/promotion/v1/items/services/dict`) теперь тоже принимает и отправляет заголовок сотрудника: спецификация объявляет его во всех операциях Продвижения.
- Списки операций и ресурсов отсортированы по алфавиту, как требует линтер n8n. Меняется только порядок в интерфейсе; значения и значения по умолчанию те же.
- Файлы и класс триггера Мессенджера переименованы с `AvitoMessengerTrigger` на `AvitoTrigger` под имя ноды. Тип ноды `avitoTrigger` не изменился, сохранённые workflow продолжают работать.
- `@n8n/node-cli` обновлён с `0.45.4` до `0.54.0` (версия закреплена: в npm она пока с тегом `beta`). Вместе с ним приходят `@n8n/eslint-plugin-community-nodes` `0.37.0` с новыми правилами `no-unsafe-connection-type-cast` и `valid-node-categories` и `eslint-plugin-n8n-nodes-base` `2.0.0`. Также обновлены `prettier` с `3.9.6` до `3.9.10` и `release-it` с `20.0.1` до `21.1.1` (требует Node `^22.22.2 || ^24.15.0 || >=26`).
- Правила n8n-nodes-base теперь действительно проверяют `src/`: `@n8n/node-cli` включает их только для `./nodes` и `./credentials`. Найденные ими 23 замечания исправлены.
- Prettier использует конфиг из шаблона `@n8n/node-cli` (`.prettierrc.js`), `src` переформатирован по нему. В прежнем конфиге не было `singleQuote`, и `npm run format` перевёл бы все строки на двойные кавычки.

#### Исправлено

- Ошибки внутри операций больше не пересобираются из одного текста при повторном выбросе: описание и HTTP-детали от Авито доходят до интерфейса n8n. Ошибки не от API (например, `TypeError`) теперь показываются как `NodeOperationError`, а не выдаются за ошибки API.
- Codex-файлы использовали префикс `n8n-nodes-base.`, зарезервированный за встроенными нодами. Теперь идентификаторы — `n8n-nodes-avito-api.avito` и `n8n-nodes-avito-api.avitoTrigger` (у триггера к тому же было указано чужое имя `avitoMessengerTrigger`).

#### Устарело

- `POST /promotion/v1/items/services/get` помечен Авито как устаревший, нода его больше не вызывает.

## 3.0.1 - 2026-08-27

Fixes the `perPage` ceiling for Autoload v4 upload items, which 3.0.0 set from the wrong endpoint.

Исправлен потолок `perPage` для объявлений загрузки Autoload v4 — в 3.0.0 он был взят от другой ручки.

### English

#### Fixed

- **Autoload v4**: `perPage` for `📃 Загрузки V4: Объявления Загрузки` was capped at `50`, but that is the limit of the uploads history endpoint. The [items endpoints](https://www.avito.ru/developers/api-catalog/autoload/documentation#operation/getLastSuccessfulUploadItems) allow `100`. The cap is now `100` and the field default moves from `50` to `100`.
  - This was never an API error — requests at `50` were accepted — but it forced twice the pages needed. A 100-id `query` took two round trips where one suffices.
  - `UPLOADS_MAX_PER_PAGE` (50) and `UPLOAD_ITEMS_MAX_PER_PAGE` (100) are now separate constants, so the uploads history keeps its own limit and the validation error quotes whichever ceiling actually applies.

### Русский

#### Исправлено

- **Автозагрузка v4**: `perPage` у операции «📃 Загрузки V4: Объявления Загрузки» был ограничен `50`, хотя это лимит ручки истории загрузок. [Ручки объявлений](https://www.avito.ru/developers/api-catalog/autoload/documentation#operation/getLastSuccessfulUploadItems) допускают `100`. Потолок поднят до `100`, дефолт поля — с `50` на `100`.
  - Ошибкой API это не было: запросы с `50` проходили, но страниц запрашивалось вдвое больше необходимого. На чанке в 100 идентификаторов в `query` уходило два запроса вместо одного.
  - `UPLOADS_MAX_PER_PAGE` (50) и `UPLOAD_ITEMS_MAX_PER_PAGE` (100) разведены в отдельные константы, поэтому история загрузок сохраняет свой лимит, а в тексте ошибки валидации называется тот потолок, который действительно применён.

## 3.0.0 - 2026-08-27

Adds the Avito Account Hierarchy API, migrates Autoload to the new v4 uploads API, and replaces the deprecated `X-Is-Employee` header in Promotion.

Добавлен API Иерархии Аккаунтов Авито, Автозагрузка переведена на новые методы загрузок v4, в Продвижении устаревший заголовок `X-Is-Employee` заменён на актуальный.

### English

#### Breaking Changes

- **Promotion**: the `Работать От Имени Сотрудника` boolean field was replaced by the numeric `ID Компании (X-Employee-Of)` field. The old value cannot be migrated automatically because a boolean carries no company ID. After upgrading, re-enter the company ID in every Promotion node that used the toggle — otherwise requests run under the personal account instead of the company. The ID is available from Account Hierarchy → `checkAhUserV2` (`avitoCompanyId`).
- **Autoload v4** paginates differently from the v2/v3 reports API: pages start at `1` instead of `0`, and `perPage` is capped at `50` instead of `200`.
- **Autoload v4** renames response fields: `report_id` → `upload_id`, `feed_url` (v2) / `feeds_urls` (v3) → `feed_urls`, `per_page` → `perPage`, `date_from` / `date_to` → `dateFrom` / `dateTo`. Expressions that read the old names must be updated.
- The package no longer declares runtime `dependencies`. If you vendored `form-data` through this node, install it in your own project.

#### Added

- Added **Account Hierarchy** resource covering the full [Иерархия Аккаунтов](https://www.avito.ru/developers/api-catalog/accounts-hierarchy/documentation) API (scope `ah:access`):
  - [`checkAhUserV2`](https://www.avito.ru/developers/api-catalog/accounts-hierarchy/documentation#operation/checkAhUserV2) — whether the user is a company, a chief, or an employee;
  - [`getAhInfoV1`](https://www.avito.ru/developers/api-catalog/accounts-hierarchy/documentation#operation/getAhInfoV1) — full hierarchy status with the list of companies the user belongs to;
  - [`getEmployeesV1`](https://www.avito.ru/developers/api-catalog/accounts-hierarchy/documentation#operation/getEmployeesV1) — company employees with names, emails, and phones;
  - [`linkItemsV1`](https://www.avito.ru/developers/api-catalog/accounts-hierarchy/documentation#operation/linkItemsV1) — link or relink up to 50 items to an employee;
  - [`listCompanyPhonesV1`](https://www.avito.ru/developers/api-catalog/accounts-hierarchy/documentation#operation/listCompanyPhonesV1) — company phones with cursor pagination;
  - [`listItemsByEmployeeIdV1`](https://www.avito.ru/developers/api-catalog/accounts-hierarchy/documentation#operation/listItemsByEmployeeIdV1) — employee items filtered by category.
  - The deprecated `checkAhUserV1` is intentionally not exposed.
  - `X-Employee-Of` is supported on the four operations that accept it per the specification; `getAhInfoV1` and `linkItemsV1` do not declare the header and never send it.
  - `linkItemsV1` answers `204 No Content`, so the node returns an explicit `{ success, employeeId, itemIds, linkedCount }` result instead of an empty item.
- Added **Autoload v4 uploads** operations, replacing the deprecated v2/v3 reports API ([migration plan](https://www.avito.ru/developers/api-catalog/autoload/documentation#migration-v4)):
  - `📥 Загрузки V4: История Загрузок` — [`getUploads`](https://www.avito.ru/developers/api-catalog/autoload/documentation#operation/getUploads), with `dateFrom` / `dateTo` filters and optional multi-page collection;
  - `📦 Загрузки V4: Одна Загрузка` — [`getCurrentUpload`](https://www.avito.ru/developers/api-catalog/autoload/documentation#operation/getCurrentUpload) or [`getLastSuccessfulUpload`](https://www.avito.ru/developers/api-catalog/autoload/documentation#operation/getLastSuccessfulUpload), selected by the new "Какая Загрузка" field;
  - `📃 Загрузки V4: Объявления Загрузки` — [`getCurrentUploadItems`](https://www.avito.ru/developers/api-catalog/autoload/documentation#operation/getCurrentUploadItems) or [`getLastSuccessfulUploadItems`](https://www.avito.ru/developers/api-catalog/autoload/documentation#operation/getLastSuccessfulUploadItems), with `query` and `sections` filters.
  - A `404` from these endpoints means "no suitable upload exists yet" rather than a wrong URL, and is reported as such.

#### Changed

- Promotion now sends [`X-Employee-Of`](https://www.avito.ru/developers/api-catalog/promotion/documentation) instead of the deprecated `X-Is-Employee` on all six operations that accept it. `/promotion/v1/items/services/dict` does not declare the header and does not send it.
- Messenger image upload builds its `multipart/form-data` body in-house instead of using the `form-data` package. Filenames and MIME types are sanitized against CRLF injection.
- Node and credential icons now declare explicit `{ light, dark }` variants.
- Updated `@n8n/node-cli` from `0.29.1` to `0.45.4` and `prettier` from `3.8.3` to `3.9.6`.

#### Deprecated

Avito is retiring the Autoload reports API. The six affected operations are now labelled `(Устарело)` in the UI, carry the shutdown date in their description, show the full migration timeline when selected, and are marked `@deprecated` in source. They keep working until the date below.

| Operation | Endpoint | Replacement |
| --- | --- | --- |
| `📊 Отчеты V2: Список Всех` | `/autoload/v2/reports` | `getUploads` |
| `📋 Отчеты V3: Детали По ID` | `/autoload/v3/reports/{report_id}` | `getUploads` |
| `📈 Отчеты V3: Последний Завершенный` | `/autoload/v3/reports/last_completed_report` | `getLastSuccessfulUpload` |
| `📄 Объявления V2: Список Из Отчета` | `/autoload/v2/reports/{report_id}/items` | `getLastSuccessfulUploadItems` |
| `🔍 Поиск V2: Статус По ID Из Файла` | `/autoload/v2/reports/items` | `getLastSuccessfulUploadItems` |
| `💰 Объявления V2: Списания Из Отчета` | `/autoload/v2/reports/{report_id}/items/fees` | none |

Timeline published by Avito:

- **2026-06-08** — v4 methods released; v2/v3 keep working unchanged and are flagged `deprecated`;
- **2026-09-08** — v2/v3 start returning incomplete historical data (anything older than 7 days);
- **2027-03-08** — v2/v3 are removed and start returning `410 Gone`.

Data with no v4 equivalent: `applied_vas` (use Item → `getItemInfo`), `fee_info` and `listing_fees` (use User → wallet operations history), `finished_at` and `processing_time` (no replacement), and the `successful` subcategories in section stats. Upload items are now available only for the current and the last successful upload, not for an arbitrary report.

#### Security

- Removed the `form-data` runtime dependency, which was affected by [GHSA-hmw2-7cc7-3qxx](https://github.com/advisories/GHSA-hmw2-7cc7-3qxx) (CRLF injection via unescaped multipart field names and filenames) across the `4.0.0`–`4.0.5` range. The package now ships with no runtime dependencies at all, as required by the `@n8n/community-nodes/no-runtime-dependencies` lint rule.

### Русский

#### Ломающие Изменения

- **Продвижение**: переключатель `Работать От Имени Сотрудника` заменён числовым полем `ID Компании (X-Employee-Of)`. Автоматически перенести старое значение невозможно: из булева флага не выводится идентификатор компании. После обновления заново укажите ID компании во всех нодах Продвижения, где галочка была включена, иначе запросы пойдут от личного аккаунта, а не от компании. Идентификатор можно получить операцией Иерархия Аккаунтов → `checkAhUserV2` (поле `avitoCompanyId`).
- **Автозагрузка v4** пагинируется иначе, чем отчёты v2/v3: страницы нумеруются с `1`, а не с `0`, а `perPage` ограничен `50` вместо `200`.
- **Автозагрузка v4** переименовывает поля ответа: `report_id` → `upload_id`, `feed_url` (v2) / `feeds_urls` (v3) → `feed_urls`, `per_page` → `perPage`, `date_from` / `date_to` → `dateFrom` / `dateTo`. Выражения, читающие старые имена, нужно поправить.
- Пакет больше не объявляет runtime-зависимостей. Если вы использовали `form-data`, приходивший вместе с нодой, установите его в своём проекте самостоятельно.

#### Добавлено

- Добавлен ресурс **Иерархия Аккаунтов**, полностью покрывающий API [Иерархия Аккаунтов](https://www.avito.ru/developers/api-catalog/accounts-hierarchy/documentation) (scope `ah:access`):
  - [`checkAhUserV2`](https://www.avito.ru/developers/api-catalog/accounts-hierarchy/documentation#operation/checkAhUserV2) — является ли пользователь компанией, руководителем или сотрудником;
  - [`getAhInfoV1`](https://www.avito.ru/developers/api-catalog/accounts-hierarchy/documentation#operation/getAhInfoV1) — полный статус в иерархии со списком компаний, которым принадлежит пользователь;
  - [`getEmployeesV1`](https://www.avito.ru/developers/api-catalog/accounts-hierarchy/documentation#operation/getEmployeesV1) — сотрудники компании с именами, email и телефонами;
  - [`linkItemsV1`](https://www.avito.ru/developers/api-catalog/accounts-hierarchy/documentation#operation/linkItemsV1) — прикрепление или перезакрепление до 50 объявлений на сотрудника;
  - [`listCompanyPhonesV1`](https://www.avito.ru/developers/api-catalog/accounts-hierarchy/documentation#operation/listCompanyPhonesV1) — телефоны компании с курсорной пагинацией;
  - [`listItemsByEmployeeIdV1`](https://www.avito.ru/developers/api-catalog/accounts-hierarchy/documentation#operation/listItemsByEmployeeIdV1) — объявления сотрудника с фильтром по категории.
  - Устаревший `checkAhUserV1` намеренно не выведен в ноду.
  - Заголовок `X-Employee-Of` поддержан в тех четырёх операциях, где он объявлен в спецификации; `getAhInfoV1` и `linkItemsV1` его не объявляют и не отправляют.
  - `linkItemsV1` отвечает `204 No Content`, поэтому нода возвращает явный результат `{ success, employeeId, itemIds, linkedCount }`, а не пустой элемент.
- Добавлены операции **Автозагрузка v4** взамен устаревающих отчётов v2/v3 ([план миграции](https://www.avito.ru/developers/api-catalog/autoload/documentation#migration-v4)):
  - `📥 Загрузки V4: История Загрузок` — [`getUploads`](https://www.avito.ru/developers/api-catalog/autoload/documentation#operation/getUploads), с фильтрами `dateFrom` / `dateTo` и необязательным обходом всех страниц;
  - `📦 Загрузки V4: Одна Загрузка` — [`getCurrentUpload`](https://www.avito.ru/developers/api-catalog/autoload/documentation#operation/getCurrentUpload) или [`getLastSuccessfulUpload`](https://www.avito.ru/developers/api-catalog/autoload/documentation#operation/getLastSuccessfulUpload) на выбор через новое поле «Какая Загрузка»;
  - `📃 Загрузки V4: Объявления Загрузки` — [`getCurrentUploadItems`](https://www.avito.ru/developers/api-catalog/autoload/documentation#operation/getCurrentUploadItems) или [`getLastSuccessfulUploadItems`](https://www.avito.ru/developers/api-catalog/autoload/documentation#operation/getLastSuccessfulUploadItems), с фильтрами `query` и `sections`.
  - Ответ `404` от этих ручек означает «подходящей загрузки ещё нет», а не неверный путь, и сообщается именно так.

#### Изменено

- Продвижение отправляет актуальный [`X-Employee-Of`](https://www.avito.ru/developers/api-catalog/promotion/documentation) вместо устаревшего `X-Is-Employee` во всех шести операциях, которые его принимают. `/promotion/v1/items/services/dict` заголовок не объявляет и не получает.
- Отправка изображения в Мессенджере собирает тело `multipart/form-data` самостоятельно, без пакета `form-data`. Имя файла и MIME-тип очищаются от CR/LF, что исключает CRLF-инъекцию.
- Иконки ноды и credentials объявляют явные варианты `{ light, dark }`.
- Обновлены `@n8n/node-cli` с `0.29.1` до `0.45.4` и `prettier` с `3.8.3` до `3.9.6`.

#### Устарело

Avito выводит из эксплуатации API отчётов Автозагрузки. Шесть затронутых операций помечены в интерфейсе как `(Устарело)`, несут дату отключения в описании, показывают полный график миграции при выборе и помечены `@deprecated` в исходниках. До указанной ниже даты они продолжают работать.

| Операция | Эндпоинт | Замена |
| --- | --- | --- |
| `📊 Отчеты V2: Список Всех` | `/autoload/v2/reports` | `getUploads` |
| `📋 Отчеты V3: Детали По ID` | `/autoload/v3/reports/{report_id}` | `getUploads` |
| `📈 Отчеты V3: Последний Завершенный` | `/autoload/v3/reports/last_completed_report` | `getLastSuccessfulUpload` |
| `📄 Объявления V2: Список Из Отчета` | `/autoload/v2/reports/{report_id}/items` | `getLastSuccessfulUploadItems` |
| `🔍 Поиск V2: Статус По ID Из Файла` | `/autoload/v2/reports/items` | `getLastSuccessfulUploadItems` |
| `💰 Объявления V2: Списания Из Отчета` | `/autoload/v2/reports/{report_id}/items/fees` | нет |

График, опубликованный Avito:

- **08.06.2026** — выпущены методы v4; v2/v3 продолжают работать без изменений и помечены `deprecated`;
- **08.09.2026** — v2/v3 начинают отдавать неполные исторические данные: всё, что старше 7 дней;
- **08.03.2027** — v2/v3 удаляются и начинают возвращать `410 Gone`.

Данные, которых в v4 не будет: `applied_vas` (смотрите Объявление → `getItemInfo`), `fee_info` и `listing_fees` (смотрите Пользователь → история операций по кошельку), `finished_at` и `processing_time` (без замены), а также подкатегории раздела `successful` в статистике. Объявления загрузки теперь доступны только для текущей и последней успешной загрузки, произвольный отчёт выбрать нельзя.

#### Безопасность

- Удалена runtime-зависимость `form-data`, затронутая [GHSA-hmw2-7cc7-3qxx](https://github.com/advisories/GHSA-hmw2-7cc7-3qxx) (CRLF-инъекция через неэкранированные имена полей и файлов в multipart) во всём диапазоне `4.0.0`–`4.0.5`. Пакет больше не поставляет ни одной runtime-зависимости, как того требует правило линтера `@n8n/community-nodes/no-runtime-dependencies`.

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
