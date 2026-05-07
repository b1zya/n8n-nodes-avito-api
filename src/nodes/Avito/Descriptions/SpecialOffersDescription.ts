import type { INodeProperties } from 'n8n-workflow';

const specialOffersResource = ['specialOffers'];

export const specialOffersOperations: INodeProperties[] = [
	{
		displayName: 'Операция',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: specialOffersResource } },
		default: 'openApiAvailable',
		options: [
			{
				name: 'Доступность Услуги По Объявлениям',
				value: 'openApiAvailable',
				description: 'Проверить доступность рассылки скидок и спецпредложений по объявлениям',
				action: 'Check special offers availability',
			},
			{
				name: 'Информация О Тарифе Рассылок',
				value: 'openApiTariffInfo',
				description: 'Получить остаток рассылок в тарифе',
				action: 'Get special offers tariff information',
			},
			{
				name: 'Создать Рассылку',
				value: 'openApiMultiCreate',
				description: 'Создать рассылку по нескольким объявлениям с фиксацией аудитории',
				action: 'Create special offers dispatches',
			},
			{
				name: 'Статистика Рассылок',
				value: 'openApiStats',
				description: 'Получить статистику по отправленным рассылкам за период',
				action: 'Get special offers statistics',
			},
			{
				name: 'Подтвердить И Оплатить Рассылку',
				value: 'openApiMultiConfirm',
				description: 'Подтвердить отправку рассылки и оплатить ее из кошелька Авито',
				action: 'Confirm and pay special offers dispatches',
			},
		],
	},
];

export const specialOffersFields: INodeProperties[] = [
	{
		displayName: 'ID Объявлений',
		name: 'specialOffersItemIds',
		type: 'string',
		required: true,
		default: '',
		description: 'Список ID объявлений через запятую',
		placeholder: '392567890,492569890',
		displayOptions: {
			show: {
				resource: specialOffersResource,
				operation: ['openApiAvailable', 'openApiMultiCreate'],
			},
		},
	},
	{
		displayName: 'Рассылки',
		name: 'specialOffersDispatches',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		required: true,
		default: {},
		description: 'Список рассылок для подтверждения и оплаты',
		displayOptions: {
			show: {
				resource: specialOffersResource,
				operation: ['openApiMultiConfirm'],
			},
		},
		options: [
			{
				name: 'dispatches',
				displayName: 'Рассылка',
				values: [
					{
						displayName: 'ID Рассылки',
						name: 'dispatchId',
						type: 'number',
						required: true,
						default: 0,
						typeOptions: { minValue: 1 },
						description: 'ID рассылки',
					},
					{
						displayName: 'Slug Предложения',
						name: 'offerSlug',
						type: 'string',
						required: true,
						default: '',
						description: 'Slug выбранного варианта предложения для рассылки',
						placeholder: 'price_discount',
					},
					{
						displayName: 'Количество Получателей',
						name: 'recipientsCount',
						type: 'number',
						required: true,
						default: 1,
						typeOptions: { minValue: 1 },
						description: 'Число получателей рассылки',
					},
					{
						displayName: 'Размер Скидки',
						name: 'discountValue',
						type: 'number',
						default: 0,
						typeOptions: { minValue: 0 },
						description: 'Финальный размер скидки. Используется только для discount-предложений; 0 не отправляется.',
					},
				],
			},
		],
	},
	{
		displayName: 'Дата Окончания Предложения',
		name: 'specialOffersExpiresAt',
		type: 'number',
		default: 0,
		description: 'Unix timestamp даты окончания предложения. 0 не отправляется.',
		typeOptions: {
			minValue: 0,
		},
		displayOptions: {
			show: {
				resource: specialOffersResource,
				operation: ['openApiMultiConfirm'],
			},
		},
	},
	{
		displayName: 'Дата И Время От',
		name: 'specialOffersDateTimeFrom',
		type: 'dateTime',
		required: true,
		default: '',
		description: 'Начало периода статистики. Перед отправкой преобразуется в RFC3339 UTC.',
		displayOptions: { show: { resource: specialOffersResource, operation: ['openApiStats'] } },
	},
	{
		displayName: 'Дата И Время До',
		name: 'specialOffersDateTimeTo',
		type: 'dateTime',
		required: true,
		default: '',
		description: 'Конец периода статистики. Перед отправкой преобразуется в RFC3339 UTC.',
		displayOptions: { show: { resource: specialOffersResource, operation: ['openApiStats'] } },
	},
	{
		displayName: '<b>Информация о Special Offers API Avito</b><br><br><b>Методы:</b><br>• <code>POST /special-offers/v1/available</code> - доступность услуги по объявлениям<br>• <code>POST /special-offers/v1/multiCreate</code> - создание рассылки<br>• <code>POST /special-offers/v1/multiConfirm</code> - подтверждение и оплата<br>• <code>POST /special-offers/v1/stats</code> - статистика рассылок<br>• <code>POST /special-offers/v1/tariffInfo</code> - остаток рассылок в тарифе<br><br><b>Scope:</b> <code>special_offers:sending</code><br><br><b>Важно:</b> API находится в beta-version. Подтверждение рассылки списывает деньги из кошелька Авито либо использует сообщения из тарифа.',
		name: 'specialOffersInfoNotice',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: specialOffersResource } },
	},
];
