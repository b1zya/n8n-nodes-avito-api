import type { INodeProperties } from 'n8n-workflow';

const cpxPromoLegacyResource = ['cpxPromoLegacy'];

export const cpxPromoLegacyOperations: INodeProperties[] = [
	{
		displayName: 'Операция',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: cpxPromoLegacyResource } },
		default: 'getBids',
		options: [
			{
				name: 'Настроить Авто Продвижение',
				value: 'setAuto',
				description: 'Legacy CPXPromo: настройка автоматического продвижения',
				action: 'Set legacy CPXPromo automatic promotion',
			},
			{
				name: 'Остановить Продвижение',
				value: 'remove',
				description: 'Legacy CPXPromo: остановка продвижения и переход на базовые цены',
				action: 'Remove legacy CPXPromo promotion',
			},
			{
				name: 'Получить Детали Ставок',
				value: 'getBids',
				description: 'Legacy CPXPromo: детализированная информация о ставках и бюджетах',
				action: 'Get legacy CPXPromo bid details',
			},
			{
				name: 'Получить Продвижения По ID',
				value: 'getPromotionsByItemIds',
				description: 'Legacy CPXPromo: текущие цены целевого действия по нескольким объявлениям',
				action: 'Get legacy CPXPromo promotions by item ids',
			},
			{
				name: 'Установить Ручную Ставку',
				value: 'setManual',
				description: 'Legacy CPXPromo: установка ручной ставки продвижения',
				action: 'Set legacy CPXPromo manual promotion',
			},
		],
	},
];

export const cpxPromoLegacyFields: INodeProperties[] = [
	{
		displayName: 'ID Объявления',
		name: 'itemId',
		type: 'number',
		description: 'Уникальный ID объявления',
		default: 0,
		required: true,
		displayOptions: {
			show: {
				resource: cpxPromoLegacyResource,
				operation: ['getBids', 'setManual', 'setAuto', 'remove'],
			},
		},
	},
	{
		displayName: 'ID Объявлений',
		name: 'itemIds',
		type: 'string',
		description: 'Список ID объявлений через запятую (максимум 200)',
		default: '',
		required: true,
		placeholder: '123456,789012,345678',
		hint: 'Legacy CPXPromo endpoint. Не является частью новой Promotion v1 API.',
		displayOptions: {
			show: { resource: cpxPromoLegacyResource, operation: ['getPromotionsByItemIds'] },
		},
	},
	{
		displayName: 'Ставка (в копейках)',
		name: 'bidPenny',
		type: 'number',
		description: 'Цена целевого действия в копейках',
		default: 0,
		required: true,
		typeOptions: { minValue: 1 },
		displayOptions: { show: { resource: cpxPromoLegacyResource, operation: ['setManual'] } },
	},
	{
		displayName: 'Тип События',
		name: 'actionTypeId',
		type: 'options',
		options: [
			{ name: 'Звонок [1]', value: 1, description: 'Оплата за звонок по объявлению' },
			{ name: 'Пакет кликов [5]', value: 5, description: 'Оплата за переходы к объявлению' },
			{
				name: 'Мессенджер, передача контакта в чате [7]',
				value: 7,
				description: 'Оплата за обращение через чат',
			},
		],
		default: 5,
		description: 'Legacy CPXPromo тип целевого действия',
		required: true,
		displayOptions: {
			show: { resource: cpxPromoLegacyResource, operation: ['setManual', 'setAuto'] },
		},
	},
	{
		displayName: 'Дневной лимит (в копейках)',
		name: 'limitPenny',
		type: 'number',
		description: 'Дневной лимит трат в копейках (необязательно)',
		default: 0,
		typeOptions: { minValue: 0 },
		displayOptions: { show: { resource: cpxPromoLegacyResource, operation: ['setManual'] } },
	},
	{
		displayName: 'Бюджет (в копейках)',
		name: 'budgetPenny',
		type: 'number',
		description: 'Бюджет в копейках',
		default: 0,
		required: true,
		typeOptions: { minValue: 1 },
		displayOptions: { show: { resource: cpxPromoLegacyResource, operation: ['setAuto'] } },
	},
	{
		displayName: 'Тип Бюджета',
		name: 'budgetType',
		type: 'options',
		options: [
			{ name: 'Дневной', value: '1d', description: 'Сутки' },
			{ name: 'Недельный', value: '7d', description: 'Неделя' },
			{ name: 'Месячный', value: '30d', description: 'Месяц' },
		],
		default: '1d',
		description: 'Срок, за который потратится бюджет',
		required: true,
		displayOptions: { show: { resource: cpxPromoLegacyResource, operation: ['setAuto'] } },
	},
	{
		displayName:
			'<b>CPXPromo Legacy</b><br><br>Эти методы используют endpoint-ы <code>/cpxpromo/1/*</code> и вынесены отдельно, чтобы не смешивать их с новой официальной Promotion v1 API.<br><br><b>Скоупы Authorization Code:</b> cpxpromo:read, cpxpromo:edit.',
		name: 'cpxPromoLegacyNotice',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: cpxPromoLegacyResource } },
	},
];
