import type { INodeProperties } from 'n8n-workflow';

export const itemOperations: INodeProperties[] = [
	{
		displayName: 'Операция',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['item'] } },
		default: 'getItems',
		options: [
			{
				name: 'Аналитика Профиля',
				value: 'analytics',
				description: 'Профильные показатели аналитики',
				action: 'Get profile analytics',
			},
			{
				name: 'Расходы Профиля',
				value: 'accountSpendings',
				description: 'Получить статистику расходов профиля',
				action: 'Get account spendings',
			},
			{
				name: 'Информация Об Объявлении',
				value: 'getItemInfo',
				description: 'Данные по конкретному объявлению',
				action: 'Get item information',
			},
			{
				name: 'Обновить Цену',
				value: 'updatePrice',
				description: 'Обновить цену объявления',
				action: 'Update item price',
			},
			{
				name: 'Применить Услугу',
				value: 'applyVas',
				description: 'Применить услугу продвижения',
				action: 'Apply a service',
			},
			{
				name: 'Список Объявлений',
				value: 'getItems',
				description: 'Получить список объявлений',
				action: 'Get all items',
			},
			{
				name: 'Статистика Звонков',
				value: 'callsStats',
				description: 'Статистика звонков по объявлениям',
				action: 'Get call statistics',
			},
			{
				name: 'Стоимость Услуг',
				value: 'getVasPrices',
				description: 'Получить цены на услуги продвижения',
				action: 'Get service prices',
			},
			{
				name: 'Счетчики Объявлений',
				value: 'statsShallow',
				description: 'Получить счетчики объявлений',
				action: 'Get item counters',
			},
		],
	},
];

export const itemFields: INodeProperties[] = [
	// ===== ОБЩИЕ ПОЛЯ =====
	
	// ID пользователя - используется в нескольких операциях
	{
		displayName: 'ID Пользователя',
		name: 'userId',
		type: 'number',
		description: 'ID пользователя Авито',
		default: 0,
		required: true,
		displayOptions: { 
			show: { 
				resource: ['item'], 
				operation: ['getItemInfo', 'getVasPrices', 'callsStats', 'statsShallow', 'analytics', 'accountSpendings']
			} 
		},
	},

	// ID объявления - используется в нескольких операциях
	{
		displayName: 'ID Объявления',
		name: 'itemId',
		type: 'number',
		description: 'Уникальный ID объявления',
		default: 0,
		required: true,
		displayOptions: { 
			show: { 
				resource: ['item'], 
				operation: ['getItemInfo', 'updatePrice', 'applyVas'] 
			} 
		},
	},

	// ID объявлений (список) - используется в нескольких операциях
	{
		displayName: 'ID Объявлений',
		name: 'itemIds',
		type: 'string',
		description: 'Список ID объявлений через запятую',
		default: '',
		required: true,
		placeholder: '123456,789012,345678',
		displayOptions: { 
			show: { 
				resource: ['item'], 
				operation: ['getVasPrices', 'statsShallow'] 
			} 
		},
	},
	{
		displayName: 'ID Объявлений',
		name: 'itemIds',
		type: 'string',
		description: 'Необязательный список ID объявлений через запятую. Если не указано, Avito вернет агрегированную статистику по пользователю.',
		default: '',
		required: false,
		placeholder: '123456,789012,345678',
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['callsStats'],
			}
		},
	},

	// Диапазон дат - используется в нескольких операциях
	{
		displayName: 'Дата Начала',
		name: 'dateFrom',
		type: 'dateTime',
		description: 'Начальная дата периода (включительно)',
		default: '',
		required: true,
		displayOptions: { 
			show: { 
				resource: ['item'], 
				operation: ['callsStats', 'statsShallow'] 
			} 
		},
	},
	{
		displayName: 'Дата Окончания',
		name: 'dateTo',
		type: 'dateTime',
		description: 'Конечная дата периода (включительно)',
		default: '',
		required: true,
		hint: 'Максимальная глубина запроса - 270 дней',
		displayOptions: { 
			show: { 
				resource: ['item'], 
				operation: ['callsStats', 'statsShallow'] 
			} 
		},
	},

	// ===== ПОЛЯ ДЛЯ getItems =====
	{
		displayName: 'Статус',
		name: 'status',
		type: 'multiOptions',
		options: [
			{ name: 'Активные', value: 'active' },
			{ name: 'Заблокированные', value: 'blocked' },
			{ name: 'Отклоненные', value: 'rejected' },
			{ name: 'Удаленные', value: 'removed' },
			{ name: 'Устаревшие', value: 'old' },
		],
		default: ['active'],
		description: 'Статусы объявлений для фильтрации. Avito принимает несколько значений через запятую.',
		displayOptions: { show: { resource: ['item'], operation: ['getItems'] } },
	},
	{
		displayName: 'Обновлено После',
		name: 'updatedAtFrom',
		type: 'dateTime',
		default: '',
		description: 'Фильтр по дате обновления/редактирования. Перед отправкой преобразуется в YYYY-MM-DD.',
		displayOptions: { show: { resource: ['item'], operation: ['getItems'] } },
	},
	{
		displayName: 'ID Категории',
		name: 'category',
		type: 'number',
		default: 0,
		description: 'ID категории объявления (0 - все категории)',
		hint: 'См. справочник категорий на avito.st/s/openapi/catalog-categories.xml',
		displayOptions: { show: { resource: ['item'], operation: ['getItems'] } },
	},

	// ===== ПОЛЯ ПАГИНАЦИИ ДЛЯ getItems =====
	{
		displayName: 'Количество Объявлений На Странице',
		name: 'perPage',
		type: 'number',
		default: 25,
		description: 'Количество записей на странице. По документации Avito: больше 0 и меньше 100.',
		hint: 'По умолчанию Avito возвращает 25 объявлений на странице.',
		typeOptions: {
			minValue: 1,
			maxValue: 99,
		},
		displayOptions: { show: { resource: ['item'], operation: ['getItems'] } },
	},
	{
		displayName: 'Начать Со Страницы',
		name: 'page',
		type: 'number',
		default: 1,
		description: 'Номер страницы для начала получения данных (начиная с 1)',
		hint: '⚠️ Будьте осторожны: указание несуществующего номера страницы может вернуть пустой результат',
		typeOptions: {
			minValue: 1,
		},
		displayOptions: { show: { resource: ['item'], operation: ['getItems'] } },
	},
	{
		displayName: 'Включить Пагинацию',
		name: 'enablePagination',
		type: 'boolean',
		default: false,
		description: 'Whether to enable automatic pagination for retrieving multiple pages',
		displayOptions: { show: { resource: ['item'], operation: ['getItems'] } },
	},
	{
		displayName: 'Тип Пагинации',
		name: 'paginationType',
		type: 'options',
		options: [
			{
				name: 'Получить Все Страницы с Объявлениями',
				value: 'all',
				description: 'Автоматически получить все доступные страницы до конца',
			},
			{
				name: 'Лимит Страниц с Объявлениями',
				value: 'limit',
				description: 'Ограничить количество страниц для получения',
			},
		],
		default: 'all',
		description: 'Выберите способ пагинации',
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['getItems'],
				enablePagination: [true],
			},
		},
	},
	{
		displayName: 'Максимум Страниц',
		name: 'maxPages',
		type: 'number',
		default: 10,
		description: 'Максимальное количество страниц для получения (защита от бесконечного цикла)',
		hint: '⚠️ Учтите: можете указать больше страниц, чем реально существует. Алгоритм автоматически остановится при достижении последней страницы.',
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['getItems'],
				enablePagination: [true],
				paginationType: ['limit'],
			},
		},
	},
	{
		displayName: 'Включить Задержку Запросов',
		name: 'enableDelay',
		type: 'boolean',
		default: false,
		description: 'Whether to add delay between requests to comply with rate limits',
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['getItems'],
				enablePagination: [true],
			},
		},
	},
	{
		displayName: 'Задержка (мс)',
		name: 'requestDelay',
		type: 'number',
		default: 10,
		description: 'Задержка между запросами в миллисекундах (защита от rate limiting)',
		hint: '💡 Рекомендуется: 10-100ms для избежания блокировок API',
		typeOptions: {
			minValue: 0,
		},
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['getItems'],
				enablePagination: [true],
				enableDelay: [true],
			},
		},
	},

	// ===== ПОЛЯ ДЛЯ updatePrice =====
	{
		displayName: 'Цена',
		name: 'price',
		type: 'number',
		description: 'Новая цена для объявления',
		default: 0,
		required: true,
		typeOptions: {
			minValue: 0,
		},
		displayOptions: { show: { resource: ['item'], operation: ['updatePrice'] } },
	},

	// ===== ПОЛЯ ДЛЯ applyVas =====
	{
		displayName: 'Услуги (Slug)',
		name: 'slugs',
		type: 'string',
		description: 'Список slug услуг через запятую (xl, highlight, x2_7, x5_7, x10_7 и т.д.)',
		default: '',
		required: true,
		placeholder: 'xl,highlight,x10_7',
		hint: 'Получите доступные услуги через операцию "Стоимость Услуг"',
		displayOptions: { show: { resource: ['item'], operation: ['applyVas'] } },
	},
	{
		displayName: 'ID Значков',
		name: 'stickers',
		type: 'string',
		default: '',
		description: 'ID значков через запятую (максимум 3). Используется с услугой XL-объявление.',
		placeholder: '1,2,3',
		hint: 'Получите доступные значки через операцию "Стоимость Услуг"',
		displayOptions: { show: { resource: ['item'], operation: ['applyVas'] } },
	},

	// ===== ПОЛЯ ДЛЯ statsShallow =====
	{
		displayName: 'Показатели',
		name: 'statsFields',
		type: 'multiOptions',
		options: [
			{
				name: 'Избранное (Устаревшее)',
				value: 'favorites',
				description: 'DEPRECATED - используйте Уникальное Избранное',
			},
			{
				name: 'Контакты (Устаревшее)',
				value: 'contacts',
				description: 'DEPRECATED - используйте Уникальные Контакты',
			},
			{
				name: 'Просмотры (Устаревшее)',
				value: 'views',
				description: 'DEPRECATED - используйте Уникальные Просмотры',
			},
			{
				name: 'Уникальное Избранное',
				value: 'uniqFavorites',
				description: 'Число уникальных пользователей',
			},
			{
				name: 'Уникальные Контакты',
				value: 'uniqContacts',
				description: 'Число уникальных пользователей',
			},
			{
				name: 'Уникальные Просмотры',
				value: 'uniqViews',
				description: 'Число уникальных пользователей',
			},
		],
		default: ['uniqViews', 'uniqContacts', 'uniqFavorites'],
		description: 'Набор счетчиков для отображения',
		displayOptions: { show: { resource: ['item'], operation: ['statsShallow'] } },
	},
	{
		displayName: 'Группировка',
		name: 'periodGrouping',
		type: 'options',
		options: [
			{ name: 'По Дням', value: 'day', description: 'Без группировки' },
			{ name: 'По Неделям', value: 'week', description: 'Суммирование за неделю' },
			{ name: 'По Месяцам', value: 'month', description: 'Суммирование за месяц' },
		],
		default: 'day',
		description: 'Период группировки статистики',
		displayOptions: { show: { resource: ['item'], operation: ['statsShallow'] } },
	},

	// ===== ПОЛЯ ДЛЯ РАСХОДОВ ПРОФИЛЯ (accountSpendings) =====
	{
		displayName: 'Дата Начала Периода',
		name: 'spendingsDateFrom',
		type: 'dateTime',
		required: true,
		description: 'Дата начала периода статистики расходов. Перед отправкой преобразуется в YYYY-MM-DD.',
		default: '',
		hint: 'Максимальная глубина запроса - 270 дней',
		displayOptions: { show: { resource: ['item'], operation: ['accountSpendings'] } },
	},
	{
		displayName: 'Дата Окончания Периода',
		name: 'spendingsDateTo',
		type: 'dateTime',
		required: true,
		description: 'Дата конца периода статистики расходов. Перед отправкой преобразуется в YYYY-MM-DD.',
		default: '',
		hint: 'Максимальная глубина запроса - 270 дней',
		displayOptions: { show: { resource: ['item'], operation: ['accountSpendings'] } },
	},
	{
		displayName: 'Группировка Расходов',
		name: 'spendingsGrouping',
		type: 'options',
		required: true,
		default: 'day',
		description: 'Группировка статистики расходов',
		options: [
			{ name: 'По Дням', value: 'day' },
			{ name: 'По Неделям', value: 'week' },
			{ name: 'По Месяцам', value: 'month' },
		],
		displayOptions: { show: { resource: ['item'], operation: ['accountSpendings'] } },
	},
	{
		displayName: 'Типы Расходов',
		name: 'spendingTypes',
		type: 'multiOptions',
		required: true,
		default: ['all'],
		description: 'Набор необходимых типов расходов',
		options: [
			{ name: 'Все Расходы', value: 'all', description: 'Все расходы' },
			{ name: 'Комиссия', value: 'commission', description: 'Комиссия' },
			{ name: 'Остальные', value: 'rest', description: 'Остальные расходы' },
			{ name: 'Продвижение', value: 'promotion', description: 'Расходы на продвижение' },
			{ name: 'Размещение И Целевые Действия', value: 'presence', description: 'Расходы на размещение и целевые действия' },
		],
		displayOptions: { show: { resource: ['item'], operation: ['accountSpendings'] } },
	},
	{
		displayName: 'Дополнительные Параметры',
		name: 'spendingsAdditionalFields',
		type: 'collection',
		placeholder: 'Добавить Поле',
		default: {},
		description: 'Фильтрация статистики расходов по категориям, объявлениям и локациям',
		displayOptions: { show: { resource: ['item'], operation: ['accountSpendings'] } },
		options: [
			{
				displayName: 'Фильтр',
				name: 'filter',
				type: 'json',
				default: '{}',
				description: 'Документированные поля фильтра: categoryIDs, itemIDs, locationIDs. Можно передать и другие поля, если Avito поддерживает их вне документации.',
				placeholder: '{\n  "categoryIDs": [11, 12],\n  "itemIDs": [534353, 534354],\n  "locationIDs": [554353]\n}',
				hint: 'ID должны быть числами в массивах. Документированные поля перечислены в подсказке, но JSON не ограничивается только ими.',
			},
		],
	},
	{
		displayName: '<b>Статистика Расходов Профиля</b><br><br>Endpoint: <code>POST /stats/v2/accounts/{user_id}/spendings</code><br><br><b>Ограничения Avito:</b><br>• Глубина данных - не более 270 дней<br>• Лимит - 1 запрос в минуту<br><br><b>Типы расходов:</b> all, promotion, presence, commission, rest',
		name: 'spendingsInfoNotice',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['item'], operation: ['accountSpendings'] } },
	},

	// ===== ПОЛЯ ДЛЯ АНАЛИТИКИ ПРОФИЛЯ (analytics) =====
	{
		displayName: 'Дата Начала Периода',
		name: 'analyticsDateFrom',
		type: 'dateTime',
		required: true,
		description: 'Дата начала периода статистики (YYYY-MM-DD)',
		default: '',
		hint: 'Авито принимает только дату (YYYY-MM-DD). Время будет проигнорировано. Максимальная глубина запроса - 270 дней',
		displayOptions: { show: { resource: ['item'], operation: ['analytics'] } },
	},
	{
		displayName: 'Дата Окончания Периода',
		name: 'analyticsDateTo',
		type: 'dateTime',
		required: true,
		description: 'Дата окончания периода статистики (YYYY-MM-DD)',
		default: '',
		hint: 'Авито принимает только дату (YYYY-MM-DD). Время будет проигнорировано. Максимальная глубина запроса - 270 дней',
		displayOptions: { show: { resource: ['item'], operation: ['analytics'] } },
	},
	{
		displayName: 'Группировка Данных',
		name: 'analyticsGrouping',
		type: 'options',
		required: true,
		description: 'Тип группировки статистических данных',
		default: 'totals',
		options: [
			{ name: 'По Дням (Day)', value: 'day', description: 'Статистика с разбивкой по дням' },
			{
				name: 'По Месяцам (Month)',
				value: 'month',
				description: 'Статистика с разбивкой по месяцам',
			},
			{
				name: 'По Неделям (Week)',
				value: 'week',
				description: 'Статистика с разбивкой по неделям',
			},
			{
				name: 'По Общему Значению (Totals)',
				value: 'totals',
				description: 'Общие значения за период',
			},
			{
				name: 'По Объявлениям (Item)',
				value: 'item',
				description: 'Статистика по каждому объявлению',
			},
		],
		displayOptions: { show: { resource: ['item'], operation: ['analytics'] } },
	},
	{
		displayName: 'Показатели Для Анализа',
		name: 'analyticsMetrics',
		type: 'multiOptions',
		required: true,
		description: 'Выберите показатели для анализа',
		default: ['views', 'contacts'],
		options: [
			// Посуточная аренда
			{
				name: '[Аренда] Заявки с Заселением',
				value: 'bookingAcceptedCount',
				description: 'С фактическим заселением',
			},
			{
				name: '[Аренда] Подтверждено Заявок',
				value: 'bookingApprovedCount',
				description: 'Подтвержденные заявки',
			},
			{ name: '[Аренда] Получено Заявок', value: 'bookingPlacedCount', description: 'Все заявки' },
			{
				name: '[Аренда] Стоимость Заявок',
				value: 'bookingPlacedPrice',
				description: 'Сумма заявок (в копейках)',
			},
			{
				name: '[Аренда] Стоимость Подтвержденных',
				value: 'bookingApprovedPrice',
				description: 'Сумма подтвержденных',
			},
			{
				name: '[Аренда] Стоимость с Заселением',
				value: 'bookingAcceptedPrice',
				description: 'Сумма с заселением',
			},

			// Авито Доставка
			{
				name: '[Доставка] Доставлено Товаров',
				value: 'deliveredItems',
				description: 'Принятые заказы',
			},
			{
				name: '[Доставка] Заказано Товаров',
				value: 'orderedItems',
				description: 'Количество заказов',
			},
			{
				name: '[Доставка] Конверсия в Заказы',
				value: 'viewsToOrderedItemsConversion',
				description: 'Процент заказов',
			},
			{
				name: '[Доставка] Стоимость Доставленных',
				value: 'deliveredItemsPrice',
				description: 'Сумма принятых (в копейках)',
			},
			{
				name: '[Доставка] Стоимость Заказов',
				value: 'orderedItemsPrice',
				description: 'Сумма заказов (в копейках)',
			},

			// Объявления (количественные)
			{ name: '[Объявления] Активные', value: 'activeItems', description: 'Активные объявления' },
			{ name: '[Объявления] Новые', value: 'newActiveItems', description: 'Новые объявления' },
			{
				name: '[Объявления] С Прошлого Периода',
				value: 'oldActiveItems',
				description: 'Остались с прошлого периода',
			},

			// Основные метрики
			{ name: '[Основные] Избранное', value: 'favorites', description: 'Добавления в избранное' },
			{
				name: '[Основные] Конверсия Показы→Просмотры',
				value: 'impressionsToViewsConversion',
				description: 'Процент перехода',
			},
			{
				name: '[Основные] Конверсия Просмотры→Контакты',
				value: 'viewsToContactsConversion',
				description: 'Процент контактов',
			},
			{ name: '[Основные] Контакты', value: 'contacts', description: 'Количество контактов' },
			{
				name: '[Основные] Написали в Чат',
				value: 'contactsMessenger',
				description: 'Сообщения в чате',
			},
			{
				name: '[Основные] Откликнулись на Скидку',
				value: 'contactsSbcDiscount',
				description: 'Отклики на спецпредложение',
			},
			{ name: '[Основные] Показы', value: 'impressions', description: 'Показы в поиске' },
			{
				name: '[Основные] Посмотрели Телефон',
				value: 'contactsShowPhone',
				description: 'Просмотры телефона',
			},
			{
				name: '[Основные] Просмотры',
				value: 'views',
				description: 'Сколько раз объявление показывалось',
			},
			{
				name: '[Основные] Средняя Цена Контакта',
				value: 'averageContactCost',
				description: 'Стоимость контакта',
			},
			{
				name: '[Основные] Средняя Цена Просмотра',
				value: 'averageViewCost',
				description: 'Стоимость просмотра',
			},
			{
				name: '[Основные] Телефон и Чат',
				value: 'contactsShowPhoneAndMessenger',
				description: 'И телефон, и чат',
			},

			// Расходы
			{
				name: '[Расходы] Все Расходы',
				value: 'allSpending',
				description: 'Всего потрачено (в копейках)',
			},
			{ name: '[Расходы] Комиссия', value: 'commission', description: 'Комиссия (в копейках)' },
			{
				name: '[Расходы] На Объявления',
				value: 'spending',
				description: 'На размещение и продвижение',
			},
			{ name: '[Расходы] На Продвижение', value: 'promoSpending', description: 'На продвижение' },
			{ name: '[Расходы] На Размещение', value: 'presenceSpending', description: 'На размещение' },
			{ name: '[Расходы] Остальные', value: 'restSpending', description: 'Прочие расходы' },
			{
				name: '[Расходы] Списано Бонусов',
				value: 'spendingBonus',
				description: 'Потрачено бонусов',
			},

			// Целевые действия
			{
				name: '[Целевые] Отклики на Вакансии',
				value: 'jobContacts',
				description: 'Отклики из тарифа',
			},
			{ name: '[Целевые] Просмотры', value: 'clickPackages', description: 'Целевые просмотры' },
		],
		displayOptions: { show: { resource: ['item'], operation: ['analytics'] } },
	},
	{
		displayName: 'Включить Пагинацию',
		name: 'analyticsEnablePagination',
		type: 'boolean',
		default: false,
		description: 'Whether to enable pagination',
		hint: 'При включении будет выполнено несколько запросов для получения всех записей. Учтите ограничения API Авито.',
		displayOptions: { 
			show: { 
				resource: ['item'], 
				operation: ['analytics'],
				analyticsGrouping: ['day', 'week', 'month', 'item']
			} 
		},
	},
	{
		displayName: 'Тип Пагинации',
		name: 'analyticsPaginationType',
		type: 'options',
		options: [
			{
				name: 'Получить Все Записи',
				value: 'all',
				description: 'Автоматически получить все доступные записи до конца (используется dataTotalCount)',
			},
			{
				name: 'Лимит Запросов',
				value: 'limit',
				description: 'Ограничить количество запросов пагинации',
			},
		],
		default: 'all',
		description: 'Выберите способ пагинации аналитики',
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['analytics'],
				analyticsEnablePagination: [true],
			},
		},
	},
	{
		displayName: 'Максимум Запросов',
		name: 'analyticsMaxRequests',
		type: 'number',
		default: 10,
		description: 'Максимальное количество запросов пагинации (защита от бесконечного цикла)',
		hint: 'Каждый запрос может получить до 1000 записей с задержкой 65+ секунд. 10 запросов = до 10000 записей за ~11 минут.',
		typeOptions: {
			minValue: 1,
			maxValue: 50,
		},
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['analytics'],
				analyticsEnablePagination: [true],
				analyticsPaginationType: ['limit'],
			},
		},
	},
	{
		displayName: 'Лимит Записей',
		name: 'analyticsLimit',
		type: 'number',
		required: true,
		description: 'Максимальное количество записей для получения',
		default: 1000,
		hint: 'Максимум 1000 записей за один запрос (ограничение API Авито). При пагинации - общий лимит для всех запросов.',
		typeOptions: {
			minValue: 1,
			maxValue: 10000,
		},
		displayOptions: { 
			show: { 
				resource: ['item'], 
				operation: ['analytics'],
				analyticsGrouping: ['day', 'week', 'month', 'item']
			} 
		},
	},
	{
		displayName: 'Смещение',
		name: 'analyticsOffset',
		type: 'number',
		required: true,
		description: 'Смещение для пагинации',
		default: 0,
		typeOptions: {
			minValue: 0,
		},
		displayOptions: { 
			show: { 
				resource: ['item'], 
				operation: ['analytics'],
				analyticsGrouping: ['day', 'week', 'month', 'item']
			} 
		},
	},
{
	displayName: 'Дополнительные Параметры',
	name: 'analyticsAdditionalFields',
	type: 'collection',
	placeholder: 'Добавить Поле',
	default: {},
	description: 'Фильтрация и сортировка результатов Analytics по категориям, сотрудникам и показателям',
	displayOptions: { show: { resource: ['item'], operation: ['analytics'] } },
	options: [
		{
			displayName: 'Фильтр',
			name: 'filter',
			type: 'json',
			default: '{}',
			description: 'Фильтрация данных<br><br><b>Документированные поля фильтра:</b><br>• <b>categoryIDs</b> - массив ID категорий<br>• <b>employeeIDs</b> - массив ID сотрудников<br><br>Можно передать и другие поля, если Avito поддерживает их вне документации.',
			placeholder: '{\n  "categoryIDs": [24, 88, 109],\n  "employeeIDs": [41042142, 41042143]\n}',
			hint: '<b>Примеры документированных фильтров:</b><br><br><b>По категориям (Авто + Недвижимость):</b><br>{"categoryIDs": [9, 24]}<br><br><b>По сотрудникам:</b><br>{"employeeIDs": [41042142, 41042143]}<br><br><b>Комбинированный:</b><br>{"categoryIDs": [24], "employeeIDs": [41042142]}<br><br><b>Справочники:</b><br>• Категории: avito.st/s/openapi/catalog-categories.xml<br>• Сотрудники: через API accounts-hierarchy<br><br><b>Важно:</b> ID должны быть числами в массивах. Нода отправляет JSON как есть.',
		},
		{
			displayName: 'Сортировка',
			name: 'sort',
			type: 'json',
			default: '{}',
			description: 'Сортировка результатов по выбранным показателям<br><br>🔧 <b>Обязательные поля:</b><br>• <b>key</b> - показатель для сортировки (из выбранных метрик)<br>• <b>order</b> - порядок: "asc" или "desc"<br><br>⚠️ <b>Важно:</b> можно сортировать только по показателям из "Показатели Для Анализа"',
			placeholder: '{\n  "key": "views",\n  "order": "desc"\n}',
			hint: '📊 <b>Примеры сортировки:</b><br><br><b>По просмотрам (убывание):</b><br>{"key": "views", "order": "desc"}<br><br><b>По контактам (возрастание):</b><br>{"key": "contacts", "order": "asc"}<br><br><b>По общим расходам:</b><br>{"key": "allSpending", "order": "desc"}<br><br><b>По просмотрам телефона:</b><br>{"key": "contactsShowPhone", "order": "desc"}<br><br><b>По заявкам аренды:</b><br>{"key": "bookingPlacedCount", "order": "desc"}<br><br>💡 <b>Популярные показатели:</b><br>• views - просмотры объявлений<br>• contacts - общие контакты<br>• contactsShowPhone - просмотры телефона<br>• allSpending - все расходы<br>• presenceSpending - расходы на размещение<br>• promoSpending - расходы на продвижение',
		},
	],
},

// Информационное поле с примерами комбинаций
{
	displayName: '<b>Quick Reference - Быстрые примеры</b><br><br><b>Популярные комбинации:</b><br><br><b>Топ категорий по просмотрам:</b><br>• Фильтр: {"categoryIDs": [24]}<br>• Сортировка: {"key": "views", "order": "desc"}<br><br><b>Эффективность сотрудников:</b><br>• Фильтр: {"employeeIDs": [41042142, 41042143]}<br>• Сортировка: {"key": "contacts", "order": "desc"}<br><br><b>Анализ расходов по категориям:</b><br>• Фильтр: {"categoryIDs": [9, 24, 88]}<br>• Сортировка: {"key": "allSpending", "order": "desc"}<br><br><b>Полезные ссылки:</b><br>• <a href="https://www.avito.st/s/openapi/catalog-categories.xml">Категории Avito</a><br>• <a href="https://developers.avito.ru/api-catalog/accounts-hierarchy/">API Сотрудников</a><br><br><b>Совет:</b> Начните с пустых полей {}, затем добавляйте фильтры по мере необходимости',
	name: 'analyticsHelpNotice',
	type: 'notice',
	default: '',
	displayOptions: { show: { resource: ['item'], operation: ['analytics'] } },
},
];
