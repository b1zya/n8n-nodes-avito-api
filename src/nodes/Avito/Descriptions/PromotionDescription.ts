import type { INodeProperties } from 'n8n-workflow';

const promotionResource = ['promotion'];

const employeeHeaderOperations = [
	'createBbipOrder',
	'getBbipForecasts',
	'getBbipSuggests',
	'getOrderStatus',
	'getServicesByItems',
	'getServicesDict',
	'listOrders',
];

const bbipOperations = ['createBbipOrder', 'getBbipForecasts'];

export const promotionOperations: INodeProperties[] = [
	{
		displayName: 'Операция',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: promotionResource } },
		default: 'getServicesDict',
		options: [
			{
				name: 'BBIP. Варианты Бюджета',
				value: 'getBbipSuggests',
				description: 'Получение доступных вариантов бюджета для продвижения',
				action: 'Get BBIP promotion suggests',
			},
			{
				name: 'BBIP. Подключить Услугу',
				value: 'createBbipOrder',
				description: 'Создать заявку на подключение BBIP',
				action: 'Create BBIP promotion order',
			},
			{
				name: 'BBIP. Прогноз Продвижения',
				value: 'getBbipForecasts',
				description: 'Получение прогноза продвижения по объявлениям',
				action: 'Get BBIP promotion forecasts',
			},
			{
				name: 'Активные Услуги По Объявлениям',
				value: 'getServicesByItems',
				description: 'Получение списка активных услуг продвижения по объявлениям (v2). При degraded: true ответ может быть неполным.',
				action: 'Get active promotion services by items',
			},
			{
				name: 'Словарь Типов Услуг',
				value: 'getServicesDict',
				description: 'Получение словаря типов услуг продвижения',
				action: 'Get promotion services dictionary',
			},
			{
				name: 'Список Заявок',
				value: 'listOrders',
				description: 'Получение списка заявок на подключение услуг',
				action: 'List promotion orders',
			},
			{
				name: 'Статус Заявки',
				value: 'getOrderStatus',
				description: 'Получение статуса заявки на подключение услуг продвижения',
				action: 'Get promotion order status',
			},
		],
	},
];

export const promotionFields: INodeProperties[] = [
	{
		displayName: 'ID Сотрудника (X-Ah-Employee-Id)',
		name: 'promotionAhEmployeeId',
		type: 'number',
		default: 0,
		description: 'Идентификатор сотрудника в иерархии аккаунтов, от имени которого выполняется запрос. Оставьте 0, чтобы работать от личного аккаунта.',
		hint: 'Это employeeId из «Иерархия Аккаунтов → Сотрудники Иерархии», а не ID компании. С 29.09.2026 методы продвижения принимают только X-Ah-Employee-Id, X-Employee-Of здесь не используется. Для подключения услуг от имени сотрудника нужен достаточный баланс «Лимит на продвижение», может понадобиться scope ah:access.',
		typeOptions: {
			minValue: 0,
		},
		displayOptions: { show: { resource: promotionResource, operation: employeeHeaderOperations } },
	},
	{
		displayName: 'Item IDs',
		name: 'promotionItemIds',
		type: 'string',
		required: true,
		default: '',
		description: 'Идентификаторы объявлений через запятую. По документации Avito максимум 100.',
		placeholder: '123456,789012',
		displayOptions: {
			show: {
				resource: promotionResource,
				operation: ['getBbipSuggests', 'getServicesByItems'],
			},
		},
	},
	{
		displayName: 'Order ID',
		name: 'promotionOrderId',
		type: 'string',
		required: true,
		default: '',
		description: 'UUID заявки на подключение услуг продвижения',
		placeholder: 'b3e1eced-f2bd-4d8c-9765-fbc9d1d222d5',
		displayOptions: { show: { resource: promotionResource, operation: ['getOrderStatus'] } },
	},
	{
		displayName: 'Page',
		name: 'promotionOrdersPage',
		type: 'number',
		required: true,
		default: 1,
		description: 'Номер страницы списка заявок',
		typeOptions: { minValue: 1 },
		displayOptions: { show: { resource: promotionResource, operation: ['listOrders'] } },
	},
	{
		displayName: 'Per Page',
		name: 'promotionOrdersPerPage',
		type: 'number',
		required: true,
		default: 20,
		description: 'Количество заявок на странице. По документации максимум 100.',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		displayOptions: { show: { resource: promotionResource, operation: ['listOrders'] } },
	},
	{
		displayName: 'Способ Ввода BBIP Items',
		name: 'promotionBbipItemsInputMode',
		type: 'options',
		default: 'json',
		options: [
			{ name: 'JSON Массив', value: 'json' },
			{ name: 'UI Коллекция', value: 'ui' },
		],
		description: 'Как передать массив объектов { itemId, duration, oldPrice, price }',
		displayOptions: { show: { resource: promotionResource, operation: bbipOperations } },
	},
	{
		displayName: 'BBIP Items JSON',
		name: 'promotionBbipItemsJson',
		type: 'json',
		required: true,
		default: '[{"itemId":123456,"duration":7,"oldPrice":10000,"price":10000}]',
		description: 'JSON-массив объектов. Поля: itemId, duration, oldPrice, price. Значения price/oldPrice в копейках за один день.',
		displayOptions: {
			show: {
				resource: promotionResource,
				operation: bbipOperations,
				promotionBbipItemsInputMode: ['json'],
			},
		},
	},
	{
		displayName: 'BBIP Items',
		name: 'promotionBbipItemsUi',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Добавить Объявление',
		default: {},
		description: 'Список объявлений для прогноза или подключения BBIP',
		displayOptions: {
			show: {
				resource: promotionResource,
				operation: bbipOperations,
				promotionBbipItemsInputMode: ['ui'],
			},
		},
		options: [
			{
				name: 'items',
				displayName: 'Объявление',
				values: [
					{
						displayName: 'Item ID',
						name: 'itemId',
						type: 'number',
						required: true,
						default: 0,
						description: 'Идентификатор объявления',
						typeOptions: { minValue: 1 },
					},
					{
						displayName: 'Duration',
						name: 'duration',
						type: 'number',
						required: true,
						default: 7,
						description: 'Период продвижения в днях',
						typeOptions: { minValue: 1 },
					},
					{
						displayName: 'Old Price',
						name: 'oldPrice',
						type: 'number',
						required: true,
						default: 10000,
						description: 'Общая ценность продвижения за один день в копейках',
						typeOptions: { minValue: 1 },
					},
					{
						displayName: 'Price',
						name: 'price',
						type: 'number',
						required: true,
						default: 10000,
						description: 'Стоимость продвижения за один день в копейках',
						typeOptions: { minValue: 1 },
					},
				],
			},
		],
	},
	{
		displayName: '<b>Promotion API v1</b><br><br>Новая версия API управления услугами продвижения. Deprecated VAS-методы из старой Item API здесь не добавляются.<br><br><b>Скоупы:</b><br>• items:info — словарь и список активных услуг<br>• items:apply_bbip — BBIP, заявки и статусы<br>• ah:access — может понадобиться для сценариев иерархии аккаунтов<br><br><b>Лимиты:</b> большинство методов 100 RPM, создание BBIP-заявки 10 RPM.',
		name: 'promotionV1Notice',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: promotionResource } },
	},
];
