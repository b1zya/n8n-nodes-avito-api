# Avito n8n Custom Node

[English](#english) | [Русский](#русский)

> **✨ Update:** v3.0.0 adds the Account Hierarchy API and migrates Autoload to the v4 uploads API. See [CHANGELOG.md](CHANGELOG.md).
>
> **⚠️ Upgrading to v3.1.1:** Promotion now sends `X-Ah-Employee-Id` (an employee ID) instead of `X-Employee-Of` (a company ID). The old `ID Компании (X-Employee-Of)` field is gone; fill in `ID Сотрудника` with the `employeeId` from Account Hierarchy → `Сотрудники Иерархии`.
>
> **⚠️ Upgrading to v3.0.0:** the Promotion `Работать От Имени Сотрудника` toggle became the numeric `ID Компании (X-Employee-Of)` field and must be filled in again — otherwise requests run under the personal account instead of the company. Autoload v4 numbers pages from `1` and renames `report_id` to `upload_id`.
>
> **⚠️ Обновление до v3.1.1:** Продвижение отправляет `X-Ah-Employee-Id` (ID сотрудника) вместо `X-Employee-Of` (ID компании). Поля «ID Компании (X-Employee-Of)» больше нет: укажите в «ID Сотрудника» значение `employeeId` из Иерархия Аккаунтов → «Сотрудники Иерархии».
>
> **⚠️ Обновление до v3.0.0:** переключатель Продвижения «Работать От Имени Сотрудника» стал числовым полем «ID Компании (X-Employee-Of)» и требует заполнения заново — иначе запросы пойдут от личного аккаунта, а не от компании. Автозагрузка v4 нумерует страницы с `1` и переименовывает `report_id` в `upload_id`.
>
> **Compatibility:** v2.0.0 may be incompatible with n8n versions earlier than `2.12.0` because OAuth2 credential handling was fundamentally changed. Recommended runtime is `n8n >= 2.19.2`; starting from this line, the Authorization Code scope issue from [#1](https://github.com/b1zya/n8n-nodes-avito-api/issues/1) is presumed to be fixed. If authentication fails after updating, recreate Avito OAuth2 credentials.
>
> **Совместимость:** v2.0.0 может быть несовместима с n8n ранее `2.12.0` из-за фундаментального изменения OAuth2 credentials. Рекомендуется `n8n >= 2.19.2`: начиная с этой ветки, проблема Authorization Code scopes из [#1](https://github.com/b1zya/n8n-nodes-avito-api/issues/1) предположительно исправлена. Если после обновления авторизация не работает, пересоздайте Avito OAuth2 credentials.

---

## English

### 🚀 Overview

**Avito n8n Custom Node** is a community node for n8n that integrates with Avito API for Business. It provides ready-to-use Avito resources in the n8n UI, including items, account hierarchy, promotion, messenger, ratings, autoload, CPA, CallTracking, user finance, tariffs, and special offers.

### ✨ Key Features

- **🔧 Convenient API Integration**: Direct access to Avito API functionality from n8n workflows
- **🔑 OAuth2 Token Management**: Avito `403 Forbidden` token expiry is handled through credential-level refresh
- **📊 Broad API Coverage**: Items, User, Account Hierarchy, Promotion v1, CPXPromo Legacy, Messenger, CPA, CallTracking, Ratings & Reviews, Autoload v4, Tariff, and Special Offers
- **🧩 Current n8n Layout**: Source code lives in `src/` and builds through `@n8n/node-cli`
- **🛡️ Validation & Error Handling**: Local validation for documented limits and clearer Avito API errors

### 🎯 Problem Solved

Avito returns `403 Forbidden` when an access token expires. Earlier n8n setups required awkward custom logic to refresh tokens on `403`. In current n8n versions this is much simpler: the credential defines hidden `tokenExpiredStatusCode: 403`, so refresh is handled at credential level.

Authorization Code scopes are entered as comma-separated values:

```text
items:info,stats:read,user:read
```

Client Credentials usually does not require scope. If a specific Avito API explicitly requires one, for example Special Offers, use the documented scope when the connection flow supports it.

Version `2.0.0` may be incompatible with n8n versions earlier than `2.12.0` because the OAuth2 credential implementation changed significantly. Use `n8n >= 2.19.2` where possible; this is the recommended line because the Authorization Code scope handling issue reported in [#1](https://github.com/b1zya/n8n-nodes-avito-api/issues/1) is presumed to be resolved there. Existing Avito OAuth2 credentials may need to be recreated after upgrading.

Version `3.0.0` does not change credential handling, but it does break two things in existing workflows. Promotion replaced the employee toggle with a company ID field, and Autoload v4 renamed response fields and changed pagination. Both are listed in [CHANGELOG.md](CHANGELOG.md#300---2026-08-27).

### 🗂️ Current Project Structure

The old root-level `nodes/` and `credentials/` layout was refactored into `src/`.

- `src/credentials/avitoOAuth2Api.credentials.ts` - OAuth2 credential
- `src/nodes/Avito/Avito.node.ts` - main Avito node
- `src/nodes/Avito/AvitoTrigger.node.ts` - Messenger webhook trigger
- `src/nodes/Avito/Descriptions/*` - node UI fields
- `src/nodes/Avito/router/RouterUtils.ts` - operation routing
- `src/nodes/Avito/<Resource>/*` - API operation implementations

The package configuration points n8n to built files under `dist/src/...`.

### 📋 Supported Avito API Methods

#### 🏠 **Items (Объявления)**

- Items list, item information, price update
- Current VAS prices and current VAS application method
- Calls statistics, shallow counters, profile analytics
- Profile spendings via `POST /stats/v2/accounts/{user_id}/spendings`
- Deprecated old Item VAS endpoints are intentionally not added

#### 👤 **User (Пользователь)**

- `GET /core/v1/accounts/self` - authorized user information
- `GET /core/v1/accounts/{user_id}/balance/` - wallet balance
- `POST /core/v1/accounts/operations_history/` - wallet operations history
- Local validation: max 1 week, not older than 1 year, `dateTimeFrom <= dateTimeTo`

#### 🏢 **Account Hierarchy (Иерархия аккаунтов)**

[Documentation](https://www.avito.ru/developers/api-catalog/accounts-hierarchy/documentation). Scope: `ah:access`.

- `GET /checkAhUserV2` - company / chief / employee status
- `GET /getAhInfoV1` - full status with the list of companies the user belongs to
- `GET /getEmployeesV1` - employees with names, emails, and phones
- `POST /linkItemsV1` - link or relink up to 50 items to an employee
- `GET /listCompanyPhonesV1` - company phones with cursor pagination
- `POST /listItemsByEmployeeIdV1` - employee items filtered by category
- `X-Employee-Of` is exposed for the four operations that accept it
- Deprecated `checkAhUserV1` is intentionally not added

#### 🎯 **Promotion (Продвижение)**

- `POST /promotion/v1/items/services/dict` - service type dictionary
- `POST /promotion/v2/items/services/get` - active services by item IDs, with the `degraded` flag for possibly incomplete data
- `POST /promotion/v1/items/services/orders/get` - orders list
- `POST /promotion/v1/items/services/orders/status` - order status
- `POST /promotion/v1/items/services/bbip/suggests/get` - BBIP budget suggestions
- `POST /promotion/v1/items/services/bbip/forecasts/get` - BBIP forecast
- `PUT /promotion/v1/items/services/bbip/orders/create` - create BBIP order
- `X-Ah-Employee-Id` (hierarchy employee ID) is sent on all seven operations; Avito no longer accepts `X-Employee-Of` or `X-Is-Employee` here

#### 🎯 **CPXPromo Legacy**

- Existing `/cpxpromo/1/*` operations are available in a separate `CPXPromo Legacy` resource
- They are not mixed with the current Promotion v1 API

#### 💬 **Messenger**

- Chats, chat by ID, V3 messages
- Send text and image messages
- Delete messages and mark chats as read
- Upload images from n8n binary data
- Voice file links, blacklist, webhook subscriptions
- Dedicated `Avito Messenger Trigger` for incoming webhook V3 events

#### 📤 **Autoload (Автозагрузка)**

[Documentation](https://www.avito.ru/developers/api-catalog/autoload/documentation).

Current v4 uploads API:

- [`GET /autoload/v4/uploads`](https://www.avito.ru/developers/api-catalog/autoload/documentation#operation/getUploads) - upload history with `dateFrom` / `dateTo` filters
- [`GET /autoload/v4/uploads/current`](https://www.avito.ru/developers/api-catalog/autoload/documentation#operation/getCurrentUpload) - current upload, freshest data, changes while running
- [`GET /autoload/v4/uploads/last_successful`](https://www.avito.ru/developers/api-catalog/autoload/documentation#operation/getLastSuccessfulUpload) - last fully processed upload, stable data
- [`GET /autoload/v4/uploads/current/items`](https://www.avito.ru/developers/api-catalog/autoload/documentation#operation/getCurrentUploadItems) and [`.../last_successful/items`](https://www.avito.ru/developers/api-catalog/autoload/documentation#operation/getLastSuccessfulUploadItems) - upload items with `query` and `sections` filters
- Pages start at `1`, `perPage` is capped at `50`

Other operations:

- Category tree and category fields
- Profile get/update (v2 profile, not the deprecated v1 one)
- File upload
- Avito ID / file ID conversion

Deprecated reports API, kept until Avito removes it — see the [migration plan](https://www.avito.ru/developers/api-catalog/autoload/documentation#migration-v4):

- `/autoload/v2/reports`, `/autoload/v3/reports/{report_id}`, `/autoload/v3/reports/last_completed_report`
- `/autoload/v2/reports/items`, `/autoload/v2/reports/{report_id}/items`, `/autoload/v2/reports/{report_id}/items/fees`
- **2026-09-08** — data older than 7 days becomes incomplete; **2027-03-08** — the endpoints return `410 Gone`
- Item fees have no v4 replacement; use User wallet operations history instead

#### 📞 **CPA**

- `POST /cpa/v3/balanceInfo`
- Calls and chats by time
- Chat by `actionId`
- Phones from target chats
- Complaints by call or `actionId`
- Required `X-Source` header is exposed in the UI

#### ☎️ **CallTracking**

- Call by ID
- Calls by time
- Call recording as binary `audio/mpeg`

#### ⭐ **Ratings & Reviews (Рейтинги и отзывы)**

- Rating info
- Reviews list with pagination
- Create review answer using documented `message`
- Remove review answer

#### 💼 **Tariff (Тарифы)**

- `GET /tariff/info/1` - current and scheduled Transport tariff info
- CPA tariffs are excluded by Avito documentation

#### 💌 **Special Offers (Рассылка скидок и спецпредложений)**

Beta API:

- `POST /special-offers/v1/available`
- `POST /special-offers/v1/multiCreate`
- `POST /special-offers/v1/multiConfirm`
- `POST /special-offers/v1/stats`
- `POST /special-offers/v1/tariffInfo`

Scope: `special_offers:sending`.

### 🛠️ Installation

1. Install the package as an n8n community node or place the built package in your custom nodes directory.
2. Restart n8n.
3. The `Avito` node and `Avito Messenger Trigger` will appear in n8n.

### ⚙️ Configuration

1. **Create Avito OAuth2 Credentials**:
   - Go to n8n Settings → Credentials
   - Add `Avito OAuth2 API`
   - Choose Client Credentials or Authorization Code
   - Enter `client_id` and `client_secret` from Avito

2. **Configure the Node**:
   - Select resource
   - Choose operation
   - Fill in required parameters
   - The node handles authentication automatically

### 🧪 Development

```bash
npm run build
npm run lint
npm run dev
npm run format
```

Minimum verification before release:

```bash
npx tsc -p tsconfig.json --noEmit
npm run lint
npm run build
```

`n8n-node` may print Node.js `[DEP0190]`; this is not a node code error.

### 💡 Development Note

This project was built with extensive AI assistance from Claude and Codex (GPT-5.5), plus manual review against Avito API documentation.

### ⚠️ Disclaimer

- This is an independent community node and is not officially affiliated with Avito or n8n
- The software is provided as-is, without warranties
- Use at your own risk and test workflows before production
- Feature requests and bug reports are welcome, but implementation is not guaranteed

### 📄 License

MIT.

### 🤝 Contributing

Issues and pull requests are welcome.

---

## Русский

### 🚀 Обзор

**Avito n8n Custom Node** — community-нода для n8n, которая интегрируется с Avito API for Business. Она добавляет готовые ресурсы Авито прямо в интерфейс n8n: объявления, иерархия аккаунтов, продвижение, мессенджер, отзывы, автозагрузка, CPA, CallTracking, пользовательские финансы, тарифы и рассылки спецпредложений.

### ✨ Ключевые особенности

- **🔧 Удобная интеграция с API**: Прямой доступ к Avito API из workflow n8n
- **🔑 OAuth2 Token Management**: Истечение токена Avito через `403 Forbidden` обрабатывается на уровне credential
- **📊 Широкое покрытие API**: Объявления, Пользователь, Иерархия аккаунтов, Promotion v1, CPXPromo Legacy, Мессенджер, CPA, CallTracking, Рейтинги и отзывы, Автозагрузка v4, Тарифы, Рассылка скидок
- **🧩 Актуальная структура n8n**: Исходники находятся в `src/`, сборка идет через `@n8n/node-cli`
- **🛡️ Валидация и ошибки**: Локальная проверка документированных лимитов и понятные ошибки Avito API

### 🎯 Решаемая Проблема

Avito возвращает `403 Forbidden`, когда access token истек. Раньше для refresh по `403` приходилось отдельно прописывать неудобную логику. В актуальных версиях n8n это намного проще: credential содержит скрытый `tokenExpiredStatusCode: 403`, поэтому refresh обрабатывается на уровне credential.

Authorization Code scopes задаются через запятую:

```text
items:info,stats:read,user:read
```

Для Client Credentials scope обычно не нужен. Если конкретный API Авито явно требует scope, например Special Offers, используйте документированный scope, когда сценарий подключения это поддерживает.

Версия `2.0.0` может быть несовместима с n8n ранее `2.12.0`, потому что реализация OAuth2 credential была существенно изменена. По возможности используйте `n8n >= 2.19.2`: начиная с этой ветки, предположительно закрыта проблема с Authorization Code scopes из [#1](https://github.com/b1zya/n8n-nodes-avito-api/issues/1). После обновления может потребоваться пересоздать Avito OAuth2 credentials.

Версия `3.0.0` не меняет работу с credentials, но ломает две вещи в существующих workflow. В Продвижении переключатель «от имени сотрудника» заменён полем с ID компании, а Автозагрузка v4 переименовала поля ответа и изменила пагинацию. Оба пункта перечислены в [CHANGELOG.md](CHANGELOG.md#300---2026-08-27).

### 🗂️ Текущая Структура Проекта

Старая корневая структура `nodes/` и `credentials/` перенесена в `src/`.

- `src/credentials/avitoOAuth2Api.credentials.ts` - OAuth2 credential
- `src/nodes/Avito/Avito.node.ts` - основная нода Avito
- `src/nodes/Avito/AvitoTrigger.node.ts` - Messenger webhook trigger
- `src/nodes/Avito/Descriptions/*` - UI-поля ноды
- `src/nodes/Avito/router/RouterUtils.ts` - роутинг операций
- `src/nodes/Avito/<Resource>/*` - реализации API-методов

В `package.json` n8n указывает на собранные файлы в `dist/src/...`.

### 📋 Поддерживаемые Методы API Авито

#### 🏠 **Объявления (Items)**

- список объявлений, информация по объявлению, обновление цены
- актуальная стоимость VAS и актуальный метод применения VAS
- статистика звонков, счетчики объявлений, аналитика профиля
- расходы профиля через `POST /stats/v2/accounts/{user_id}/spendings`
- deprecated VAS endpoints из старого Item API намеренно не добавляются

#### 👤 **Пользователь (User)**

- `GET /core/v1/accounts/self` - информация об авторизованном пользователе
- `GET /core/v1/accounts/{user_id}/balance/` - баланс кошелька
- `POST /core/v1/accounts/operations_history/` - история операций кошелька
- локальная проверка: максимум 1 неделя, не дальше 1 года, `dateTimeFrom <= dateTimeTo`

#### 🏢 **Иерархия Аккаунтов (Account Hierarchy)**

[Документация](https://www.avito.ru/developers/api-catalog/accounts-hierarchy/documentation). Scope: `ah:access`.

- `GET /checkAhUserV2` - статус компании / руководителя / сотрудника
- `GET /getAhInfoV1` - полный статус со списком компаний, которым принадлежит пользователь
- `GET /getEmployeesV1` - сотрудники с именами, email и телефонами
- `POST /linkItemsV1` - прикрепление или перезакрепление до 50 объявлений на сотрудника
- `GET /listCompanyPhonesV1` - телефоны компании с курсорной пагинацией
- `POST /listItemsByEmployeeIdV1` - объявления сотрудника с фильтром по категории
- `X-Employee-Of` вынесен в UI для тех четырёх операций, которые его принимают
- deprecated `checkAhUserV1` намеренно не добавлен

#### 🎯 **Продвижение (Promotion)**

- `POST /promotion/v1/items/services/dict` - словарь типов услуг
- `POST /promotion/v2/items/services/get` - активные услуги по объявлениям с признаком `degraded` для возможно неполных данных
- `POST /promotion/v1/items/services/orders/get` - список заявок
- `POST /promotion/v1/items/services/orders/status` - статус заявки
- `POST /promotion/v1/items/services/bbip/suggests/get` - варианты бюджета BBIP
- `POST /promotion/v1/items/services/bbip/forecasts/get` - прогноз BBIP
- `PUT /promotion/v1/items/services/bbip/orders/create` - создание BBIP-заявки
- `X-Ah-Employee-Id` (ID сотрудника иерархии) отправляется во всех семи операциях; `X-Employee-Of` и `X-Is-Employee` Avito здесь больше не принимает

#### 🎯 **CPXPromo Legacy**

- существующие операции `/cpxpromo/1/*` доступны в отдельном ресурсе `CPXPromo Legacy`
- они не смешиваются с актуальным Promotion v1 API

#### 💬 **Мессенджер**

- чаты, чат по ID, сообщения V3
- отправка текста и изображений
- удаление сообщений и отметка чата прочитанным
- загрузка изображений из binary data n8n
- ссылки на голосовые файлы, blacklist, webhook-подписки
- отдельный `Avito Messenger Trigger` для входящих webhook V3 событий

#### 📤 **Автозагрузка (Autoload)**

[Документация](https://www.avito.ru/developers/api-catalog/autoload/documentation).

Актуальный API загрузок v4:

- [`GET /autoload/v4/uploads`](https://www.avito.ru/developers/api-catalog/autoload/documentation#operation/getUploads) - история загрузок с фильтрами `dateFrom` / `dateTo`
- [`GET /autoload/v4/uploads/current`](https://www.avito.ru/developers/api-catalog/autoload/documentation#operation/getCurrentUpload) - текущая загрузка, самые свежие данные, меняются в процессе
- [`GET /autoload/v4/uploads/last_successful`](https://www.avito.ru/developers/api-catalog/autoload/documentation#operation/getLastSuccessfulUpload) - последняя полностью обработанная загрузка, стабильные данные
- [`GET /autoload/v4/uploads/current/items`](https://www.avito.ru/developers/api-catalog/autoload/documentation#operation/getCurrentUploadItems) и [`.../last_successful/items`](https://www.avito.ru/developers/api-catalog/autoload/documentation#operation/getLastSuccessfulUploadItems) - объявления загрузки с фильтрами `query` и `sections`
- страницы нумеруются с `1`, `perPage` ограничен `50`

Остальные операции:

- дерево категорий и поля категории
- получение и обновление профиля (профиль v2, а не устаревший v1)
- загрузка файла
- конвертация Avito ID / file ID

Устаревающий API отчётов, оставлен до отключения на стороне Авито — см. [план миграции](https://www.avito.ru/developers/api-catalog/autoload/documentation#migration-v4):

- `/autoload/v2/reports`, `/autoload/v3/reports/{report_id}`, `/autoload/v3/reports/last_completed_report`
- `/autoload/v2/reports/items`, `/autoload/v2/reports/{report_id}/items`, `/autoload/v2/reports/{report_id}/items/fees`
- **08.09.2026** — данные старше 7 дней становятся неполными; **08.03.2027** — ручки начинают возвращать `410 Gone`
- списаниям по объявлениям замены в v4 нет, используйте историю операций кошелька в ресурсе «Пользователь»

#### 📞 **CPA**

- `POST /cpa/v3/balanceInfo`
- звонки и чаты по времени
- чат по `actionId`
- телефоны из целевых чатов
- жалобы по звонку или `actionId`
- обязательный заголовок `X-Source` вынесен в UI

#### ☎️ **CallTracking**

- звонок по ID
- звонки по времени
- аудиозапись звонка как binary `audio/mpeg`

#### ⭐ **Рейтинги И Отзывы (Ratings & Reviews)**

- информация о рейтинге
- список отзывов с пагинацией
- создание ответа на отзыв с документированным полем `message`
- удаление ответа на отзыв

#### 💼 **Тарифы (Tariff)**

- `GET /tariff/info/1` - информация о текущем и запланированном тарифе в категории Транспорт
- CPA-тарифы исключены по документации Авито

#### 💌 **Рассылка Скидок И Спецпредложений (Special Offers)**

Beta API:

- `POST /special-offers/v1/available`
- `POST /special-offers/v1/multiCreate`
- `POST /special-offers/v1/multiConfirm`
- `POST /special-offers/v1/stats`
- `POST /special-offers/v1/tariffInfo`

Scope: `special_offers:sending`.

### 🛠️ Установка

1. Установите пакет как n8n community node или поместите собранный пакет в директорию custom nodes.
2. Перезапустите n8n.
3. В n8n появятся `Avito` и `Avito Messenger Trigger`.

### ⚙️ Настройка

1. **Создайте Avito OAuth2 Credentials**:
   - Перейдите в n8n Settings → Credentials
   - Добавьте `Avito OAuth2 API`
   - Выберите Client Credentials или Authorization Code
   - Укажите `client_id` и `client_secret` из Авито

2. **Настройте ноду**:
   - Выберите ресурс
   - Выберите операцию
   - Заполните обязательные параметры
   - Нода автоматически обрабатывает авторизацию

### 🧪 Разработка

```bash
npm run build
npm run lint
npm run dev
npm run format
```

Минимальная проверка перед релизом:

```bash
npx tsc -p tsconfig.json --noEmit
npm run lint
npm run build
```

`n8n-node` может выводить предупреждение Node.js `[DEP0190]`; это не ошибка кода ноды.

### 💡 Заметка О Разработке

Проект разрабатывался с активной помощью Claude и Codex (GPT-5.5), а также ручной сверкой с документацией Avito API.

### ⚠️ Отказ От Ответственности

- Это независимая community-нода без официальной связи с Avito или n8n
- ПО предоставляется как есть, без гарантий
- Используйте на свой риск и тестируйте workflow перед production
- Feature requests и bug reports приветствуются, но реализация не гарантируется

### 📄 Лицензия

MIT.

### 📝 Примечание О Верификации n8n

Нода намеренно использует русский язык в интерфейсе, потому что ориентирована на пользователей Авито. Если n8n добавит полноценную локализацию, интерфейс можно будет адаптировать под многоязычный формат.

### 🤝 Вклад В Проект

Issues и pull requests приветствуются.

---

### 🔗 Полезные Ссылки

- [Авито API для разработчиков](https://developers.avito.ru/)
- [Документация n8n](https://docs.n8n.io/)
- [Рекомендации по деплою community nodes](https://docs.n8n.io/integrations/creating-nodes/deploy/)
