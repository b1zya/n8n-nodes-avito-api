import type { INodeProperties } from 'n8n-workflow';

export const baseProperties: INodeProperties[] = [
	{
		displayName: 'Ресурс',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		default: 'item',
		options: [
			{ name: 'Автозагрузка', value: 'autoload' },
			{ name: 'Иерархия Аккаунтов', value: 'accountHierarchy' },
			{ name: 'Мессенджер', value: 'messenger' },
			{ name: 'Объявление', value: 'item' },
			{ name: 'Пользователь', value: 'user' },
			{ name: 'Продвижение', value: 'promotion' },
			{ name: 'Продвижение CPXPromo (Legacy)', value: 'cpxPromoLegacy' },
			{ name: 'Рассылка Скидок И Спецпредложений', value: 'specialOffers' },
			{ name: 'Рейтинги и Отзывы', value: 'ratings' },
			{ name: 'Тарифы', value: 'tariff' },
			{ name: 'CallTracking', value: 'callTracking' },
			{ name: 'CPA', value: 'cpa' },
		],
	},
];
