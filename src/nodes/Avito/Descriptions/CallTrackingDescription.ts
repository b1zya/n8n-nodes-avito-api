import type { INodeProperties } from 'n8n-workflow';

export const callTrackingOperations: INodeProperties[] = [
	{
		displayName: 'Операция',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['callTracking'] } },
		default: 'getCallById',
		options: [
			{
				name: 'Звонок По ID',
				value: 'getCallById',
				description: 'Получение информации о звонке по callId',
				action: 'Get calltracking call by ID',
			},
			{
				name: 'Звонки По Времени',
				value: 'getCalls',
				description: 'Получение списка звонков с фильтром по callTime',
				action: 'Get calltracking calls by time',
			},
			{
				name: 'Аудиозапись Звонка',
				value: 'getRecordByCallId',
				description: 'Получение аудиозаписи звонка по callId',
				action: 'Get calltracking record by call ID',
			},
		],
	},
];

export const callTrackingFields: INodeProperties[] = [
	{
		displayName: 'Call ID',
		name: 'callTrackingCallId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Идентификатор звонка',
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['callTracking'],
				operation: ['getCallById', 'getRecordByCallId'],
			},
		},
	},
	{
		displayName: 'Дата И Время От',
		name: 'callTrackingDateTimeFrom',
		type: 'dateTime',
		required: true,
		default: '',
		description: 'Время, с которого нужно начинать поиск звонков по callTime. Перед отправкой преобразуется в RFC3339 UTC, например 2021-01-02T00:00:00Z.',
		displayOptions: { show: { resource: ['callTracking'], operation: ['getCalls'] } },
	},
	{
		displayName: 'Дата И Время До',
		name: 'callTrackingDateTimeTo',
		type: 'dateTime',
		default: '',
		description: 'Время, до которого нужно искать звонки по callTime. Перед отправкой преобразуется в RFC3339 UTC. Если не указано, Avito использует dateTimeFrom + 1 месяц. Максимум dateTimeFrom + 3 месяца.',
		displayOptions: { show: { resource: ['callTracking'], operation: ['getCalls'] } },
	},
	{
		displayName: 'Лимит',
		name: 'callTrackingLimit',
		type: 'number',
		required: true,
		default: 100,
		description: 'Размер выборки. По документации максимум 100.',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		displayOptions: { show: { resource: ['callTracking'], operation: ['getCalls'] } },
	},
	{
		displayName: 'Смещение',
		name: 'callTrackingOffset',
		type: 'number',
		required: true,
		default: 0,
		description: 'Смещение выборки',
		typeOptions: {
			minValue: 0,
		},
		displayOptions: { show: { resource: ['callTracking'], operation: ['getCalls'] } },
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'record',
		description: 'Имя binary-поля, в которое будет записан audio/mpeg файл',
		displayOptions: { show: { resource: ['callTracking'], operation: ['getRecordByCallId'] } },
	},
	{
		displayName: 'Имя Файла',
		name: 'fileName',
		type: 'string',
		default: '',
		description: 'Имя файла для аудиозаписи. Если не указано, будет использовано call-{callId}.mp3.',
		placeholder: 'call-record.mp3',
		displayOptions: { show: { resource: ['callTracking'], operation: ['getRecordByCallId'] } },
	},
	{
		displayName: 'Включить Задержку Между Items',
		name: 'enableCallTrackingDelay',
		type: 'boolean',
		default: false,
		description: 'Whether to add a delay before each CallTracking request after the first input item',
		hint: 'По документации getCallById/getCalls ограничены 5 запросами/мин, getRecordByCallId - 50 запросами/мин.',
		displayOptions: { show: { resource: ['callTracking'] } },
	},
	{
		displayName: 'Задержка (мс)',
		name: 'callTrackingRequestDelay',
		type: 'number',
		default: 12000,
		description: 'Задержка перед каждым CallTracking-запросом после первого входного item',
		hint: 'Для лимита 5 запросов/мин используйте 12000 мс. Для 50 запросов/мин - 1200 мс.',
		typeOptions: {
			minValue: 0,
		},
		displayOptions: { show: { resource: ['callTracking'], enableCallTrackingDelay: [true] } },
	},
	{
		displayName: '<b>CallTracking API Avito</b><br><br>Методы работают через OAuth Client Credentials.<br><br><b>Лимиты по документации:</b><br>• Звонок по ID: 5 запросов/мин<br>• Звонки по времени: 5 запросов/мин<br>• Аудиозапись звонка: 50 запросов/мин<br><br><b>Аудиозаписи:</b><br>• Доступны в течение 3 месяцев после завершения звонка<br>• Обычно становятся доступны с задержкой до 30 минут<br>• Endpoint может вернуть 425 Too Early, если запись еще не готова<br>• Ответ сохраняется в binary-поле как audio/mpeg',
		name: 'callTrackingInfoNotice',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['callTracking'] } },
	},
];
