import type { INodeProperties } from 'n8n-workflow';

export const autoloadOperations: INodeProperties[] = [
	{
		displayName: 'Операция',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['autoload'] } },
		default: 'getProfile',
		options: [
			{
				name: '⚙️ Настройки Профиля: Создать/Изменить',
				value: 'createOrUpdateProfile',
				description: 'Настройка профиля: ссылки на файлы, расписание, email. Обязательно согласие при создании.',
				action: 'Create or update autoload profile',
			},
			{
				name: '🌲 Справочник: Дерево Категорий',
				value: 'getCategoryTree',
				description: 'Получение дерева всех категорий Авито',
				action: 'Get category tree',
			},
			{
				name: '👤 Настройки Профиля: Получить',
				value: 'getProfile',
				description: 'Просмотр текущих настроек: ссылки на файлы, расписание выгрузок, email для отчетов',
				action: 'Get autoload profile',
			},
			{
				name: '💰 Объявления V2: Списания Из Отчета (Устарело)',
				value: 'getReportItemsFees',
				description: 'Устарело, удаление 08.03.2027. Прямой замены нет: в v4 данных о списаниях (fee_info, listing_fees) не будет. История операций по кошельку — операция "Пользователь: История Операций".',
				action: 'Get autoload report items fees',
			},
			{
				name: '📄 Объявления V2: Список Из Отчета (Устарело)',
				value: 'getReportItems',
				description: 'Устарело, удаление 08.03.2027. Замена — "Загрузки V4: Объявления Загрузки" с целью "Последняя успешно завершённая": параметр report_id там не нужен.',
				action: 'Get autoload report items',
			},
			{
				name: '📈 Отчеты V3: Последний Завершенный (Устарело)',
				value: 'getLastReport',
				description: 'Устарело, удаление 08.03.2027. Замена — "Загрузки V4: Одна Загрузка" с целью "Последняя успешно завершённая".',
				action: 'Get last autoload report',
			},
            {
				name: '📊 Отчеты V2: Список Всех (Устарело)',
				value: 'getReports',
				description: 'Устарело, удаление 08.03.2027. Замена — "Загрузки V4: История Загрузок".',
				action: 'Get autoload reports',
			},
			{
				name: '📋 Отчеты V3: Детали По ID (Устарело)',
				value: 'getReportById',
				description: 'Устарело, удаление 08.03.2027. Замена — "Загрузки V4: История Загрузок": статистика каждой загрузки приходит прямо в списке, отдельный запрос по ID не нужен.',
				action: 'Get autoload report by ID',
			},
			{
				name: '📥 Загрузки V4: История Загрузок',
				value: 'getUploads',
				description: 'Список загрузок с фильтром по датам и пагинацией. Самая свежая загрузка идёт первой.',
				action: 'Get autoload uploads history',
			},
			{
				name: '📦 Загрузки V4: Одна Загрузка',
				value: 'getUpload',
				description: 'Статистика по текущей или по последней успешно завершённой загрузке: статус, разделы, события, файлы фида.',
				action: 'Get autoload upload',
			},
			{
				name: '📃 Загрузки V4: Объявления Загрузки',
				value: 'getUploadItems',
				description: 'Объявления текущей или последней успешно завершённой загрузки с фильтрами по строке и разделам',
				action: 'Get autoload upload items',
			},
			{
				name: '📝 Справочник: Поля Категории',
				value: 'getCategoryFields',
				description: 'Получение всех полей для категории: обязательные/необязательные, типы данных, возможные значения',
				action: 'Get category fields',
			},
			{
				name: '🔄 Конвертация: Avito ID → Файл ID',
				value: 'getAdIdsByAvitoIds',
				description: 'Получение ID объявлений из файла по ID на Авито',
				action: 'Get file ids by avito ids',
			},
			{
				name: '🔍 Поиск V2: Статус По ID Из Файла (Устарело)',
				value: 'getAutoloadItemsInfoV2',
				description: 'Устарело, удаление 08.03.2027. Замена — "Загрузки V4: Объявления Загрузки" с целью "Последняя успешно завершённая" и фильтром по поисковому запросу.',
				action: 'Get autoload items info by file id',
			},
			{
				name: '🔗 Конвертация: Файл ID → Avito ID',
				value: 'getAvitoIdsByAdIds',
				description: 'Получение ID объявлений на Авито по ID из файла',
				action: 'Get avito ids by file ids',
			},
			{
				name: '🚀 Ручная Загрузка Файла',
				value: 'uploadFile',
				description: 'Внеочередная загрузка файла. Игнорирует лимиты из настроек. Максимум 1 раз в час.',
				action: 'Upload autoload file',
			},
		],
	},
];

export const autoloadFields: INodeProperties[] = [
	// ===== ПОЛЯ ДЛЯ createOrUpdateProfile =====
	{
		displayName: 'Статус автозагрузки (включена/выключена)',
		name: 'autoloadEnabled',
		type: 'boolean',
		required: true,
		default: true,
		description: 'Whether to enable autoload (on/off)',
		displayOptions: { show: { resource: ['autoload'], operation: ['createOrUpdateProfile'] } },
	},
	{
		displayName: 'Email Для Отчетов',
		name: 'reportEmail',
		type: 'string',
		required: true,
		default: '',
		description: 'Почта, на которую будут приходить отчеты о выгрузках',
		placeholder: 'user@example.com',
		displayOptions: { show: { resource: ['autoload'], operation: ['createOrUpdateProfile'] } },
	},
	{
		displayName: 'Данные Фидов',
		name: 'feedsData',
		type: 'json',
		required: true,
		default: '[{"feed_name": "Основной фид", "feed_url": "https://example.com/feed.xml"}]',
		description: 'Массив данных о фидах с названиями файлов и ссылками',
		placeholder: '[{"feed_name": "Основной фид", "feed_url": "https://example.com/feed.xml"}]',
		hint: 'Каждый объект должен содержать feed_name (название) и feed_url (ссылка на файл). Можно указать null для очистки.',
		displayOptions: { show: { resource: ['autoload'], operation: ['createOrUpdateProfile'] } },
	},
	{
		displayName: 'Расписание Выгрузок',
		name: 'schedule',
		type: 'json',
		required: true,
		default: '[{"rate": 100, "weekdays": [0,1,2,3,4], "time_slots": [9,10,11]}]',
		description: 'Расписание регулярных выгрузок с периодами и лимитами',
		placeholder: '[{"rate": 100, "weekdays": [0,1,2,3,4], "time_slots": [9,10,11]}]',
		hint: 'Массив объектов. rate - количество объявлений за период, weekdays - дни недели (0=ПН, 6=ВС), time_slots - часы (0-23). Время по Москве.',
		displayOptions: { show: { resource: ['autoload'], operation: ['createOrUpdateProfile'] } },
	},
	{
		displayName: 'Согласие с Правилами Автозагрузки',
		name: 'agreement',
		type: 'boolean',
		default: false,
		description: 'Whether to accept the autoload terms',
		hint: 'Обязательно при создании нового профиля. Ссылка на правила: https://support.avito.ru/articles/203867776',
		displayOptions: { show: { resource: ['autoload'], operation: ['createOrUpdateProfile'] } },
	},

	// ===== ИНФОРМАЦИОННАЯ ПОДСКАЗКА ДЛЯ createOrUpdateProfile =====
	{
		displayName: '🔧 <b>Создание и настройка профиля автозагрузки</b><br><br>📋 <b>Обязательные поля:</b><br>• <b>Включить Автозагрузку</b> - включить/выключить автозагрузку<br>• <b>Email Для Отчетов</b> - email для отчетов о выгрузках<br>• <b>Данные Фидов</b> - данные о фидах (файлах)<br>• <b>Расписание Выгрузок</b> - расписание выгрузок<br><br>🆕 <b>Создание нового профиля:</b><br>• <b>Согласие с Правилами: true</b> - обязательно при первом создании<br>• Согласие с <a href="https://support.avito.ru/articles/203867776">правилами Авито Автозагрузки</a><br><br>📊 <b>Структура Данных Фидов:</b><br>• feed_name - название фида для отчетов<br>• feed_url - ссылка на XML/CSV файл (http/https)<br>• Можно передать null для очистки настроек<br><br>⏰ <b>Структура Расписания:</b><br>• <b>rate</b> - количество объявлений за период<br>• <b>weekdays</b> - дни недели: [0,1,2,3,4,5,6] где 0=Понедельник<br>• <b>time_slots</b> - часы: [0,1,2...23] когда запускать выгрузку<br>• Время указывается по Москве<br><br>💡 <b>Примеры расписания:</b><br>• Рабочие дни 9-11 утра: [{"rate": 100, "weekdays": [0,1,2,3,4], "time_slots": [9,10,11]}]<br>• Ежедневно в полночь: [{"rate": 50, "weekdays": [0,1,2,3,4,5,6], "time_slots": [0]}]<br>• Выходные днем: [{"rate": 200, "weekdays": [5,6], "time_slots": [12,13,14,15,16]}]',
		name: 'createProfileNotice',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['autoload'], operation: ['createOrUpdateProfile'] } },
	},

	// ===== ПОЛЯ ДЛЯ getReports (ПАГИНАЦИЯ) =====
	{
		displayName: 'Номер Страницы',
		name: 'page',
		type: 'number',
		required: true,
		description: 'Номер страницы (начиная с 0)',
		default: 0,
		typeOptions: {
			minValue: 0,
		},
		displayOptions: { show: { resource: ['autoload'], operation: ['getReports'] } },
	},
	{
		displayName: 'Количество На Странице',
		name: 'perPage',
		type: 'number',
		required: true,
		description: 'Количество отчетов на странице (1-200)',
		default: 50,
		typeOptions: {
			minValue: 1,
			maxValue: 200,
		},
		displayOptions: { show: { resource: ['autoload'], operation: ['getReports'] } },
	},
	{
		displayName: 'Фильтры Отчетов',
		name: 'reportsFilters',
		type: 'collection',
		placeholder: 'Добавить Фильтр',
		default: {},
		description: 'Фильтрация отчетов по дате создания',
		displayOptions: { show: { resource: ['autoload'], operation: ['getReports'] } },
		options: [
			{
				displayName: 'Дата Создания От',
				name: 'date_from',
				type: 'dateTime',
				default: '',
				description: 'Фильтр по дате создания отчета от указанного момента. Avito ожидает формат RFC3339.',
			},
			{
				displayName: 'Дата Создания До',
				name: 'date_to',
				type: 'dateTime',
				default: '',
				description: 'Фильтр по дате создания отчета до указанного момента. Avito ожидает формат RFC3339.',
			},
		],
	},

	// Настройки пагинации для getReports
	{
		displayName: 'Включить Автоматическую Пагинацию',
		name: 'enablePagination',
		type: 'boolean',
		default: false,
		description: 'Whether to fetch all reports (enable pagination)',
		hint: 'При включении будет выполнено несколько запросов для получения всех отчетов.',
		displayOptions: { show: { resource: ['autoload'], operation: ['getReports'] } },
	},
	{
		displayName: 'Тип Пагинации',
		name: 'paginationType',
		type: 'options',
		options: [
			{
				name: 'Получить Все Отчеты',
				value: 'all',
				description: 'Автоматически получить все доступные отчеты до конца',
			},
			{
				name: 'Лимит Страниц',
				value: 'limit',
				description: 'Ограничить количество страниц для получения отчетов',
			},
		],
		default: 'all',
		description: 'Выберите способ пагинации отчетов',
		displayOptions: {
			show: {
				resource: ['autoload'],
				operation: ['getReports'],
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
		hint: 'Каждая страница может содержать до 200 отчетов. 10 страниц = до 2000 отчетов.',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				resource: ['autoload'],
				operation: ['getReports'],
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
		description: 'Whether to add a delay between requests',
		displayOptions: {
			show: {
				resource: ['autoload'],
				operation: ['getReports'],
				enablePagination: [true],
			},
		},
	},
	{
		displayName: 'Задержка (мс)',
		name: 'requestDelay',
		type: 'number',
		default: 200,
		description: 'Задержка между запросами в миллисекундах',
		hint: 'Рекомендуется 200+ мс для избежания блокировок API',
		typeOptions: {
			minValue: 0,
		},
		displayOptions: {
			show: {
				resource: ['autoload'],
				operation: ['getReports'],
				enablePagination: [true],
				enableDelay: [true],
			},
		},
	},

	// ===== ПОЛЯ ДЛЯ getReportById =====
	{
		displayName: 'ID Отчета',
		name: 'reportId',
		type: 'number',
		required: true,
		description: 'Уникальный ID отчета автозагрузки',
		default: 0,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: { 
			show: { 
				resource: ['autoload'], 
				operation: ['getReportById', 'getReportItems', 'getReportItemsFees'] 
			} 
		},
	},

	// ===== ПОЛЯ ДЛЯ getReportItems (ПАГИНАЦИЯ) =====
	{
		displayName: 'Номер Страницы',
		name: 'itemsPage',
		type: 'number',
		required: true,
		description: 'Номер страницы (начиная с 0)',
		default: 0,
		typeOptions: {
			minValue: 0,
		},
		displayOptions: { show: { resource: ['autoload'], operation: ['getReportItems'] } },
	},
	{
		displayName: 'Количество На Странице',
		name: 'itemsPerPage',
		type: 'number',
		required: true,
		description: 'Количество объявлений на странице (1-200)',
		default: 50,
		typeOptions: {
			minValue: 1,
			maxValue: 200,
		},
		displayOptions: { show: { resource: ['autoload'], operation: ['getReportItems'] } },
	},

	// Фильтры для getReportItems
	{
		displayName: 'Дополнительные Фильтры',
		name: 'itemsFilters',
		type: 'collection',
		placeholder: 'Добавить Фильтр',
		default: {},
		description: 'Фильтрация объявлений в отчете',
		displayOptions: { show: { resource: ['autoload'], operation: ['getReportItems'] } },
		options: [
			{
				displayName: 'ID Объявлений',
				name: 'query',
				type: 'string',
				default: '',
				description: 'Фильтр по ID объявлений из файла или ID объявлений на Авито, через запятую или |',
				placeholder: 'item1,item2 или 12345|67890',
			},
			{
				displayName: 'Разделы Отчета',
				name: 'sections',
				type: 'string',
				default: '',
				description: 'Фильтр по идентификаторам разделов отчета, через запятую или |',
				placeholder: 'success,error или section1|section2',
			},
		],
	},

	// Настройки пагинации для getReportItems
	{
		displayName: 'Включить Автоматическую Пагинацию',
		name: 'itemsEnablePagination',
		type: 'boolean',
		default: false,
		description: 'Whether to fetch all ads (enable pagination)',
		displayOptions: { show: { resource: ['autoload'], operation: ['getReportItems'] } },
	},
	{
		displayName: 'Тип Пагинации',
		name: 'itemsPaginationType',
		type: 'options',
		options: [
			{
				name: 'Получить Все Объявления',
				value: 'all',
				description: 'Автоматически получить все доступные объявления до конца',
			},
			{
				name: 'Лимит Страниц',
				value: 'limit',
				description: 'Ограничить количество страниц для получения объявлений',
			},
		],
		default: 'all',
		description: 'Выберите способ пагинации объявлений',
		displayOptions: {
			show: {
				resource: ['autoload'],
				operation: ['getReportItems'],
				itemsEnablePagination: [true],
			},
		},
	},
	{
		displayName: 'Максимум Страниц',
		name: 'itemsMaxPages',
		type: 'number',
		default: 20,
		description: 'Максимальное количество страниц для получения',
		hint: 'Каждая страница может содержать до 200 объявлений.',
		typeOptions: {
			minValue: 1,
			maxValue: 500,
		},
		displayOptions: {
			show: {
				resource: ['autoload'],
				operation: ['getReportItems'],
				itemsEnablePagination: [true],
				itemsPaginationType: ['limit'],
			},
		},
	},

	// ===== ПОЛЯ ДЛЯ getReportItemsFees (ПАГИНАЦИЯ С ОСОБЕННОСТЬЮ) =====
	{
		displayName: 'Номер Страницы',
		name: 'feesPage',
		type: 'number',
		required: true,
		description: 'Номер страницы (начиная с 0 для этого метода!)',
		default: 0,
		typeOptions: {
			minValue: 0,
		},
		hint: 'Внимание: в отличие от других методов, здесь нумерация страниц начинается с 0',
		displayOptions: { show: { resource: ['autoload'], operation: ['getReportItemsFees'] } },
	},
	{
		displayName: 'Количество На Странице',
		name: 'feesPerPage',
		type: 'number',
		required: true,
		description: 'Количество записей о списаниях на странице (1-200)',
		default: 100,
		typeOptions: {
			minValue: 1,
			maxValue: 200,
		},
		displayOptions: { show: { resource: ['autoload'], operation: ['getReportItemsFees'] } },
	},

	// Фильтры для getReportItemsFees
	{
		displayName: 'Фильтры Списаний',
		name: 'feesFilters',
		type: 'collection',
		placeholder: 'Добавить Фильтр',
		default: {},
		description: 'Фильтрация записей о списаниях',
		displayOptions: { show: { resource: ['autoload'], operation: ['getReportItemsFees'] } },
		options: [
			{
				displayName: 'ID Объявлений',
				name: 'ad_ids',
				type: 'string',
				default: '',
				description: 'Фильтр по ID объявлений из файла (через запятую или |)',
				placeholder: '12345,67890 или 12345|67890',
			},
			{
				displayName: 'Avito ID',
				name: 'avito_ids',
				type: 'string',
				default: '',
				description: 'Фильтр по ID объявлений на Avito (через запятую или |)',
				placeholder: '1234567890,9876543210',
			},
		],
	},

	// Настройки пагинации для getReportItemsFees
	{
		displayName: 'Включить Автоматическую Пагинацию',
		name: 'feesEnablePagination',
		type: 'boolean',
		default: false,
		description: 'Whether to fetch all write-off records (enable pagination)',
		displayOptions: { show: { resource: ['autoload'], operation: ['getReportItemsFees'] } },
	},

	// ===== ПОЛЯ ДЛЯ getCategoryFields =====
	{
		displayName: 'Дополнительные Заголовки',
		name: 'additionalHeaders',
		type: 'fixedCollection',
		placeholder: 'Добавить Заголовок',
		default: {},
		description: 'Дополнительный HTTP заголовок для запроса (If-Modified-Since - опционально)',
		displayOptions: { show: { resource: ['autoload'], operation: ['getCategoryTree', 'getCategoryFields'] } },
		options: [
			{
				name: 'parameter',
				displayName: 'Заголовок',
				values: [
					{
						displayName: 'Название',
						name: 'name',
						type: 'string',
						default: '',
						placeholder: 'If-Modified-Since',
						description: 'Название HTTP заголовка. Указать If-Modified-Since.',
					},
					{
						displayName: 'Значение',
						name: 'value',
						type: 'string',
						default: '',
						placeholder: 'Mon, 01 Jan 2025 00:00:00 UTC',
						description: 'Значение HTTP заголовка. Дата и время последней полученной версии в формате RFC1123 в UTC.',
					},
				],
			},
		],
	},
	{
		displayName: 'Slug Категории',
		name: 'nodeSlug',
		type: 'string',
		required: true,
		description: 'Slug категории для получения полей',
		default: '',
		placeholder: 'remont',
		hint: 'Получите актуальные slug через операцию "Дерево Категорий"',
		displayOptions: { show: { resource: ['autoload'], operation: ['getCategoryFields'] } },
	},

	// ===== ПОЛЯ ДЛЯ getAutoloadItemsInfoV2 =====
	{
		displayName: 'ID Объявлений Из Файла',
		name: 'autoloadItemsQuery',
		type: 'string',
		required: true,
		description: 'ID объявлений из файла автозагрузки через запятую (1-100 штук)',
		default: '',
		placeholder: 'item1,item2,item3',
		hint: 'Максимум 100 ID через запятую или символ |. Используются ID из параметра Id в XML файле.',
		displayOptions: { show: { resource: ['autoload'], operation: ['getAutoloadItemsInfoV2'] } },
	},

	// ===== ПОЛЯ ДЛЯ getAdIdsByAvitoIds =====
	{
		displayName: 'ID Объявлений На Авито',
		name: 'avitoIdsQuery',
		type: 'string',
		required: true,
		description: 'ID объявлений на сайте Авито через запятую',
		default: '',
		placeholder: '1234567890,9876543210',
		hint: 'ID объявлений на Авито через запятую или символ |',
		displayOptions: { show: { resource: ['autoload'], operation: ['getAdIdsByAvitoIds'] } },
	},

	// ===== ПОЛЯ ДЛЯ getAvitoIdsByAdIds =====

	{
		displayName: 'ID Объявлений Из Файла',
		name: 'adIdsQuery',
		type: 'string',
		required: true,
		description: 'ID объявлений из файла автозагрузки через запятую',
		default: '',
		placeholder: 'item1,item2,item3',
		hint: 'ID объявлений из XML файла через запятую или символ |. Используются ID из параметра Id в XML файле.',
		displayOptions: { show: { resource: ['autoload'], operation: ['getAvitoIdsByAdIds'] } },
	},

	// ===== ИНФОРМАЦИОННЫЕ ПОДСКАЗКИ =====
	{
		displayName: '📂 <b>Получение категорий и полей</b><br><br>🌲 <b>Дерево категорий:</b><br>• Получите полный список всех доступных категорий<br>• Найдите нужный slug в структуре категорий<br>• Используйте slug для получения полей конкретной категории<br><br>📋 <b>Поля категории:</b><br>• Получение всех полей для конкретной категории<br>• Информация о зависимостях полей<br>• Возможные значения и их типы<br>• Ссылки на каталоги значений<br><br>⚠️ <b>Важно:</b><br>• <b>Сначала используйте "Дерево Категорий"</b> для получения актуальных slug<br>• Slug категорий могут изменяться со временем<br>• Не используйте примеры slug без проверки их актуальности<br><br>🔍 <b>Как найти slug:</b><br>1. Выполните операцию "Дерево Категорий"<br>2. Найдите нужную категорию в ответе<br>3. Скопируйте значение поля "slug"<br>4. Используйте его в операции "Поля Категории"',
		name: 'categoryInfoNotice',
		type: 'notice',
		default: '',
		displayOptions: { 
			show: { 
				resource: ['autoload'], 
				operation: ['getCategoryTree', 'getCategoryFields'] 
			} 
		},
	},
	{
		displayName: '📊 <b>Информация об отчетах автозагрузки</b><br><br>📄 <b>Пагинация отчетов:</b><br>• Максимум 200 отчетов за запрос<br>• page начинается с 0<br>• total показывает общее количество отчетов<br>• Можно фильтровать по date_from и date_to в формате RFC3339<br><br>📈 <b>Структура отчета:</b><br>• <b>report_id</b> - уникальный ID отчета<br>• <b>started_at</b> - дата начала выгрузки<br>• <b>finished_at</b> - дата окончания выгрузки<br>• <b>status</b> - статус выгрузки<br>• <b>section_stats</b> - статистика по разделам<br>• <b>listing_fees</b> - информация о списаниях<br><br>📋 <b>Статусы выгрузки:</b><br>• processing - отчет в процессе<br>• success - загрузка прошла без ошибок<br>• success_warning - в части объявлений есть ошибки<br>• error - загрузка не удалась<br><br>🔗 <b>Дополнительно:</b><br>• feeds_urls - ссылки на файлы выгрузки в v3 отчетах<br>• section_stats - количество объявлений в каждом разделе',
		name: 'reportsInfoNotice',
		type: 'notice',
		default: '',
		displayOptions: { 
			show: { 
				resource: ['autoload'], 
				operation: ['getReports', 'getLastReport', 'getReportById'] 
			} 
		},
	},
	{
		displayName: '📝 <b>Информация об объявлениях в выгрузке</b><br><br>📄 <b>Пагинация объявлений:</b><br>• Максимум 200 объявлений за запрос<br>• page начинается с 0<br>• Поддерживаются фильтры query и sections<br><br>📊 <b>Структура объявления в отчете:</b><br>• <b>ad_id</b> - ID объявления из файла<br>• <b>avito_id</b> - ID объявления на Avito<br>• <b>avito_status</b> - статус объявления на Avito<br>• <b>section</b> - раздел отчета<br>• <b>messages</b> - ошибки или предупреждения<br>• <b>applied_vas</b> - примененные услуги продвижения<br><br>🎯 <b>Статусы Avito:</b><br>• active - объявление активно<br>• old - срок размещения истек<br>• blocked - объявление заблокировано<br>• rejected - объявление отклонено<br>• archived - объявление в архиве<br>• removed - объявление удалено<br><br>🔍 <b>Фильтрация:</b><br>• query - ID из файла или Avito ID<br>• sections - идентификаторы разделов отчета<br>• Разделители: запятая или символ |',
		name: 'itemsInfoNotice',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['autoload'], operation: ['getReportItems'] } },
	},
	{
		displayName: '💰 <b>Информация о списаниях за объявления</b><br><br>⚠️ <b>Особенность пагинации:</b><br>• page начинается с 0<br>• Максимум 200 записей за запрос<br>• Используйте правильную нумерацию страниц<br><br>📊 <b>Структура списания:</b><br>• <b>ad_id</b> - ID объявления из файла<br>• <b>avito_id</b> - ID объявления на Avito<br>• <b>fees_amount</b> - сумма списания или количество размещений из пакета<br>• <b>fees_package_id</b> - ID пакета размещений, если списание было из пакета<br>• <b>fees_type</b> - тип списания<br><br>💳 <b>Типы списания:</b><br>• <b>single</b> - разовая оплата<br>• <b>package</b> - списание из пакета размещений<br><br>🔍 <b>Фильтрация:</b><br>• По ad_ids - ID из XML файла<br>• По avito_ids - ID на сайте Avito<br>• Можно комбинировать фильтры',
		name: 'feesInfoNotice',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['autoload'], operation: ['getReportItemsFees'] } },
	},
	{
		displayName: '📤 <b>Загрузка файла по ссылке привязанной к профилю:</b><br>• Файл должен быть доступен к загрузке в момент запроса.<br>• Формат файла: XLS/XLSX/CSV/XML<br><br>⚠️ <b>ВАЖНЫЕ ОГРАНИЧЕНИЯ:</b><br>• <b>Лимит частоты: МАКСИМУМ 1 ЗАПРОС В ЧАС</b><br>• При превышении лимита API вернет ошибку<br>• Планируйте запуски заранее<br><br>🚀 <b>Особенности загрузки:</b><br>• <b>ИГНОРИРУЕТ лимиты публикаций</b> из настроек профиля<br>• <b>ВСЕ валидные объявления</b> из файла будут опубликованы или активированы<br>• Подходит для полной загрузки больших каталогов<br><br>🔧 <b>Предварительная настройка:</b><br>1. Настройте URL файла через "Создать/Обновить Профиль"<br>2. Убедитесь что файл доступен по HTTP/HTTPS<br>3. Проверьте настройки через "Получить Профиль Автозагрузки"<br>4. Запустите загрузку (помните об ограничении в 1 час)',
		name: 'otherInfoNotice',
		type: 'notice',
		default: '',
		displayOptions: { 
			show: { 
				resource: ['autoload'], 
				operation: ['uploadFile'] 
			} 
		},
	},

	// ===== ИНФОРМАЦИОННЫЕ ПОДСКАЗКИ ДЛЯ НОВЫХ МЕТОДОВ =====
	{
		displayName: '🔍 <b>Поиск объявлений по ID из файла</b><br><br>📋 <b>Назначение:</b><br>• Получение подробной информации об объявлениях<br>• По ID из XML файла автозагрузки<br>• Текущий статус, ошибки, ссылки на Авито<br><br>📝 <b>Формат ID:</b><br>• ID из параметра &lt;ID&gt; в XML файле<br>• От 1 до 100 ID за запрос<br>• Разделители: запятая (,) или символ (|)<br><br>📊 <b>Что получите:</b><br>• Статус объявления на Авито<br>• Дата окончания размещения<br>• Информация о списаниях<br>• Ошибки и предупреждения<br>• Ссылка на объявление',
		name: 'autoloadItemsInfoNotice',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['autoload'], operation: ['getAutoloadItemsInfoV2'] } },
	},
	{
		displayName: '🔗 <b>Получение ID из файла по Avito ID</b><br><br>📋 <b>Назначение:</b><br>• Связь между ID на Авито и ID в файле<br>• Полезно для синхронизации данных<br>• Обратное сопоставление объявлений<br><br>🔍 <b>Входные данные:</b><br>• ID объявлений на сайте Авито<br>• Например: 1234567890, 9876543210<br>• Разделители: запятая (,) или символ (|)<br><br>📊 <b>Результат:</b><br>• Пары: Avito ID → ID из файла<br>• Null если объявление не найдено в автозагрузке<br>• Полезно для отчетности и аналитики',
		name: 'adIdsByAvitoIdsNotice',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['autoload'], operation: ['getAdIdsByAvitoIds'] } },
	},
	{
		displayName: '🔗 <b>Получение Avito ID по ID из файла</b><br><br>📋 <b>Назначение:</b><br>• Связь между ID в файле и ID на Авито<br>• Поиск опубликованных объявлений<br>• Прямое сопоставление объявлений<br><br>🔍 <b>Входные данные:</b><br>• ID из параметра &lt;ID&gt; в XML файле<br>• Например: item1, item2, item3<br>• Разделители: запятая (,) или символ (|)<br><br>📊 <b>Результат:</b><br>• Пары: ID из файла → Avito ID<br>• Null если объявление не опубликовано<br>• Быстрый поиск статуса публикации',
		name: 'avitoIdsByAdIdsNotice',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['autoload'], operation: ['getAvitoIdsByAdIds'] } },
	},
	{
		displayName:
			'⛔ <b>Эта операция выводится из эксплуатации</b><br><br>Avito переводит работу с автозагрузкой со старых методов отчётов (v2/v3) на новые методы загрузок (v4).<br><br>📅 <b>График:</b><br>• <b>08.06.2026</b> — опубликованы методы v4, старые помечены deprecated и работают без изменений<br>• <b>08.09.2026</b> — старые методы начнут отдавать неполные исторические данные: всё, что старше 7 дней<br>• <b>08.03.2027</b> — старые методы будут удалены и начнут возвращать <b>410 Gone</b><br><br>🔀 <b>Замены в этой ноде:</b><br>• Список отчётов и детали по ID → <b>Загрузки V4: История Загрузок</b><br>• Последний завершённый отчёт → <b>Загрузки V4: Одна Загрузка</b> (цель «Последняя успешно завершённая»)<br>• Объявления из отчёта и поиск по ID из файла → <b>Загрузки V4: Объявления Загрузки</b><br>• Списания по объявлениям → <b>прямой замены нет</b><br><br>⚠️ <b>Данных, которых в v4 не будет:</b><br>• <b>applied_vas</b> — применённые услуги продвижения. Доступны через «Объявление: Информация Об Объявлении»<br>• <b>fee_info</b>, <b>listing_fees</b> — списания. История операций по кошельку доступна через «Пользователь: История Операций»<br>• <b>finished_at</b>, <b>processing_time</b> — без замены<br>• Подкатегории раздела «Успешно опубликовано» в статистике: остаётся только общее количество в successful.count<br>• Объявления загрузки теперь доступны только для текущей и последней успешной загрузки, произвольный отчёт выбрать нельзя<br><br>🔤 <b>Переименования полей (данные те же):</b><br>• report_id → upload_id<br>• feed_url (v2) / feeds_urls (v3) → feed_urls<br>• per_page → perPage<br>• date_from / date_to → dateFrom / dateTo',
		name: 'autoloadDeprecationNotice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: {
				resource: ['autoload'],
				operation: ['getReports', 'getReportById', 'getLastReport', 'getReportItems', 'getReportItemsFees', 'getAutoloadItemsInfoV2'],
			},
		},
	},
	// ===== ПОЛЯ ДЛЯ ОПЕРАЦИЙ AUTOLOAD V4 =====
	{
		displayName: 'Какая Загрузка',
		name: 'uploadTarget',
		type: 'options',
		default: 'lastSuccessful',
		description: 'Какую загрузку запрашивать у Avito',
		options: [
			{
				name: 'Последняя Успешно Завершённая',
				value: 'lastSuccessful',
				description: 'Загрузка, обработавшая весь фид. Данные стабильные, но возможна задержка в определении завершённости.',
			},
			{
				name: 'Текущая',
				value: 'current',
				description: 'Последняя загрузка, обработавшая хотя бы одно объявление. Данные самые свежие, но могут меняться в процессе.',
			},
		],
		displayOptions: {
			show: { resource: ['autoload'], operation: ['getUpload', 'getUploadItems'] },
		},
	},
	{
		displayName: 'Номер Страницы',
		name: 'uploadsPage',
		type: 'number',
		default: 1,
		description: 'Номер страницы. В Autoload API v4 нумерация начинается с 1.',
		typeOptions: { minValue: 1 },
		displayOptions: { show: { resource: ['autoload'], operation: ['getUploads'] } },
	},
	{
		displayName: 'Количество На Странице',
		name: 'uploadsPerPage',
		type: 'number',
		default: 10,
		description: 'Количество загрузок на странице. По документации Avito максимум 50.',
		typeOptions: { minValue: 1, maxValue: 50 },
		displayOptions: { show: { resource: ['autoload'], operation: ['getUploads'] } },
	},
	{
		displayName: 'Фильтры По Дате',
		name: 'uploadsFilters',
		type: 'collection',
		placeholder: 'Добавить фильтр',
		default: {},
		options: [
			{
				displayName: 'Дата От',
				name: 'dateFrom',
				type: 'dateTime',
				default: '',
				description: 'Фильтр по дате загрузки "от" в формате RFC3339',
			},
			{
				displayName: 'Дата До',
				name: 'dateTo',
				type: 'dateTime',
				default: '',
				description: 'Фильтр по дате загрузки "до" в формате RFC3339',
			},
		],
		displayOptions: { show: { resource: ['autoload'], operation: ['getUploads'] } },
	},
	{
		displayName: 'Собирать Все Страницы',
		name: 'uploadsEnablePagination',
		type: 'boolean',
		default: false,
		description: 'Whether to walk through pages automatically and merge the results',
		displayOptions: { show: { resource: ['autoload'], operation: ['getUploads'] } },
	},
	{
		displayName: 'Режим Обхода',
		name: 'uploadsPaginationType',
		type: 'options',
		default: 'all',
		options: [
			{ name: 'Все Страницы', value: 'all', description: 'Идти до конца списка' },
			{ name: 'Лимит Страниц', value: 'limit', description: 'Остановиться после заданного числа страниц' },
		],
		displayOptions: {
			show: { resource: ['autoload'], operation: ['getUploads'], uploadsEnablePagination: [true] },
		},
	},
	{
		displayName: 'Максимум Страниц',
		name: 'uploadsMaxPages',
		type: 'number',
		default: 10,
		description: 'Сколько страниц пройти в режиме лимита',
		typeOptions: { minValue: 1, maxValue: 1000 },
		displayOptions: {
			show: {
				resource: ['autoload'],
				operation: ['getUploads'],
				uploadsEnablePagination: [true],
				uploadsPaginationType: ['limit'],
			},
		},
	},
	{
		displayName: 'Задержка Между Страницами (Мс)',
		name: 'uploadsRequestDelay',
		type: 'number',
		default: 0,
		description: 'Пауза перед каждым следующим запросом, чтобы не упереться в лимиты Avito',
		typeOptions: { minValue: 0 },
		displayOptions: {
			show: { resource: ['autoload'], operation: ['getUploads'], uploadsEnablePagination: [true] },
		},
	},
	{
		displayName: 'Номер Страницы',
		name: 'uploadItemsPage',
		type: 'number',
		default: 1,
		description: 'Номер страницы. В Autoload API v4 нумерация начинается с 1.',
		typeOptions: { minValue: 1 },
		displayOptions: { show: { resource: ['autoload'], operation: ['getUploadItems'] } },
	},
	{
		displayName: 'Количество На Странице',
		name: 'uploadItemsPerPage',
		type: 'number',
		default: 100,
		description: 'Количество объявлений на странице. По документации Avito максимум 100 (у истории загрузок — 50).',
		typeOptions: { minValue: 1, maxValue: 100 },
		displayOptions: { show: { resource: ['autoload'], operation: ['getUploadItems'] } },
	},
	{
		displayName: 'Фильтры Объявлений',
		name: 'uploadItemsFilters',
		type: 'collection',
		placeholder: 'Добавить фильтр',
		default: {},
		options: [
			{
				displayName: 'Поисковый Запрос',
				name: 'query',
				type: 'string',
				default: '',
				description: 'Строка поиска по объявлениям загрузки',
			},
			{
				displayName: 'Разделы',
				name: 'sections',
				type: 'string',
				default: '',
				description: 'Слаги разделов через запятую, например errors,warnings',
			},
		],
		displayOptions: { show: { resource: ['autoload'], operation: ['getUploadItems'] } },
	},
	{
		displayName: 'Собирать Все Страницы',
		name: 'uploadItemsEnablePagination',
		type: 'boolean',
		default: false,
		description: 'Whether to walk through pages automatically and merge the results',
		displayOptions: { show: { resource: ['autoload'], operation: ['getUploadItems'] } },
	},
	{
		displayName: 'Режим Обхода',
		name: 'uploadItemsPaginationType',
		type: 'options',
		default: 'all',
		options: [
			{ name: 'Все Страницы', value: 'all', description: 'Идти до конца списка' },
			{ name: 'Лимит Страниц', value: 'limit', description: 'Остановиться после заданного числа страниц' },
		],
		displayOptions: {
			show: { resource: ['autoload'], operation: ['getUploadItems'], uploadItemsEnablePagination: [true] },
		},
	},
	{
		displayName: 'Максимум Страниц',
		name: 'uploadItemsMaxPages',
		type: 'number',
		default: 20,
		description: 'Сколько страниц пройти в режиме лимита',
		typeOptions: { minValue: 1, maxValue: 1000 },
		displayOptions: {
			show: {
				resource: ['autoload'],
				operation: ['getUploadItems'],
				uploadItemsEnablePagination: [true],
				uploadItemsPaginationType: ['limit'],
			},
		},
	},
	{
		displayName: 'Задержка Между Страницами (Мс)',
		name: 'uploadItemsRequestDelay',
		type: 'number',
		default: 0,
		description: 'Пауза перед каждым следующим запросом, чтобы не упереться в лимиты Avito',
		typeOptions: { minValue: 0 },
		displayOptions: {
			show: { resource: ['autoload'], operation: ['getUploadItems'], uploadItemsEnablePagination: [true] },
		},
	},
];
