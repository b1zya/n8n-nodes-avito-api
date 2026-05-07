import type { INodeProperties } from 'n8n-workflow';

export const baseProperties: INodeProperties[] = [
	{
		displayName: 'Ресурс',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		default: 'item',
		options: [
			{ name: 'Объявление', value: 'item' },
			{ name: 'Пользователь', value: 'user' },
			{ name: 'Продвижение', value: 'promotion' },
			{ name: 'Продвижение CPXPromo (Legacy)', value: 'cpxPromoLegacy' },
			{ name: 'Рейтинги и Отзывы', value: 'ratings' },
			{ name: 'Автозагрузка', value: 'autoload' },
			{ name: 'Тарифы', value: 'tariff' },
			{ name: 'Рассылка Скидок И Спецпредложений', value: 'specialOffers' },
			{ name: 'CPA', value: 'cpa' },
			{ name: 'CallTracking', value: 'callTracking' },
			{ name: 'Мессенджер', value: 'messenger' },
		],
	},
];
