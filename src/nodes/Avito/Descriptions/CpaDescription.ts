import type { INodeProperties } from 'n8n-workflow';

export const cpaOperations: INodeProperties[] = [
	{
		displayName: 'Операция',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['cpa'] } },
		default: 'getBalance',
		options: [
			{
				name: 'Баланс',
				value: 'getBalance',
				description: 'Получение текущего CPA-баланса в копейках через /cpa/v3/balanceInfo',
				action: 'Get CPA balance',
			},
			{
				name: 'Звонки По Времени',
				value: 'getCallsByTime',
				description: 'Получение списка CPA-звонков по времени создания',
				action: 'Get CPA calls by time',
			},
			{
				name: 'Чат По Action ID',
				value: 'getChatByActionId',
				description: 'Получение CPA-чата по идентификатору целевого действия',
				action: 'Get CPA chat by action ID',
			},
			{
				name: 'Чаты По Времени',
				value: 'getChatsByTime',
				description: 'Получение списка CPA-чатов по времени создания',
				action: 'Get CPA chats by time',
			},
			{
				name: 'Жалоба На Звонок',
				value: 'createCallComplaint',
				description: 'Создание жалобы на CPA-звонок по callId',
				action: 'Create CPA call complaint',
			},
			{
				name: 'Жалоба По Action ID',
				value: 'createActionComplaint',
				description: 'Создание жалобы на целевое действие по actionId',
				action: 'Create CPA action complaint',
			},
			{
				name: 'Телефоны Из Целевых Чатов',
				value: 'getPhonesInfoFromChats',
				description: 'Получение информации по номерам телефонов из целевых чатов',
				action: 'Get phones info from CPA chats',
			},
		],
	},
];

export const cpaFields: INodeProperties[] = [
	{
		displayName: 'X-Source',
		name: 'xSource',
		type: 'string',
		required: true,
		default: 'n8n-nodes-avito-api',
		description:
			'Имя сервиса, отправляющего запрос в CPA API Avito. Передается в обязательном заголовке X-Source.',
		placeholder: 'my-company-n8n',
		displayOptions: { show: { resource: ['cpa'] } },
	},
	{
		displayName: 'Дата И Время От',
		name: 'dateTimeFrom',
		type: 'dateTime',
		required: true,
		default: '',
		description:
			'Время, с которого нужно начинать поиск. Перед отправкой преобразуется в RFC3339 UTC, например 2021-01-02T15:04:05Z.',
		displayOptions: {
			show: {
				resource: ['cpa'],
				operation: ['getCallsByTime', 'getChatsByTime', 'getPhonesInfoFromChats'],
			},
		},
	},
	{
		displayName: 'Лимит',
		name: 'limit',
		type: 'number',
		required: true,
		default: 100,
		description: 'Размер выборки',
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['cpa'],
				operation: ['getCallsByTime', 'getPhonesInfoFromChats'],
			},
		},
	},
	{
		displayName: 'Лимит',
		name: 'chatLimit',
		type: 'number',
		required: true,
		default: 100,
		description: 'Размер выборки чатов. По документации значение должно быть не более 100.',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		displayOptions: { show: { resource: ['cpa'], operation: ['getChatsByTime'] } },
	},
	{
		displayName: 'Смещение',
		name: 'offset',
		type: 'number',
		required: true,
		default: 0,
		description:
			'Смещение выборки. Для производительности Avito рекомендует использовать максимальное время из предыдущей выборки.',
		typeOptions: {
			minValue: 0,
		},
		displayOptions: {
			show: {
				resource: ['cpa'],
				operation: ['getCallsByTime', 'getChatsByTime', 'getPhonesInfoFromChats'],
			},
		},
	},
	{
		displayName: 'Action ID',
		name: 'actionId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Идентификатор целевого действия',
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['cpa'],
				operation: ['getChatByActionId', 'createActionComplaint'],
			},
		},
	},
	{
		displayName: 'Call ID',
		name: 'callId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Идентификатор звонка',
		typeOptions: {
			minValue: 1,
		},
		displayOptions: { show: { resource: ['cpa'], operation: ['createCallComplaint'] } },
	},
	{
		displayName: 'Включить Задержку Между Items',
		name: 'enableCpaDelay',
		type: 'boolean',
		default: false,
		description: 'Whether to add a delay before each CPA request after the first input item',
		hint: 'Полезно для CPA-методов с низкими лимитами, например 1 запрос/мин для звонков по времени и жалобы на звонок.',
		displayOptions: { show: { resource: ['cpa'] } },
	},
	{
		displayName: 'Задержка (мс)',
		name: 'cpaRequestDelay',
		type: 'number',
		default: 60000,
		description: 'Задержка перед каждым CPA-запросом после первого входного item',
		hint: 'Для лимита 1 запрос/мин используйте 60000 мс. Для 3 запросов/мин - 20000 мс. Для 40 запросов/мин - 1500 мс.',
		typeOptions: {
			minValue: 0,
		},
		displayOptions: { show: { resource: ['cpa'], enableCpaDelay: [true] } },
	},
	{
		displayName: 'Сообщение Жалобы',
		name: 'complaintMessage',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		required: true,
		default: '',
		description: 'Текст жалобы, который будет отправлен в Avito',
		placeholder: 'Клиент позвонил по ошибке',
		displayOptions: {
			show: {
				resource: ['cpa'],
				operation: ['createCallComplaint', 'createActionComplaint'],
			},
		},
	},
	{
		displayName:
			'<b>CPA API Avito</b><br><br>CPA-методы требуют OAuth Client Credentials и обязательный заголовок <b>X-Source</b> - имя сервиса, отправляющего запрос.<br><br><b>Лимиты по документации:</b><br>• Баланс: 50 запросов/мин<br>• Звонки по времени: 1 запрос/мин<br>• Чат по actionId: 3 запроса/мин<br>• Чаты по времени: 40 запросов/мин<br>• Жалоба на звонок: 1 запрос/мин<br>• Жалоба по actionId: 3 запроса/мин<br>• Телефоны из целевых чатов: 5 запросов/мин<br><br>При пакетной обработке включите задержку между input items. При превышении Avito возвращает 429 и заголовки X-RateLimit-Limit / X-RateLimit-Remaining.',
		name: 'cpaInfoNotice',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['cpa'] } },
	},
];
