import type { INodeProperties } from 'n8n-workflow';

export const baseProperties: INodeProperties[] = [
	{
		displayName: 'Ресурс',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		default: 'item',
		// The rule sorts with String#localeCompare in the runtime's default locale, and this list
		// mixes Latin and Cyrillic names: en-US puts Latin first, ru-RU puts it last, so no
		// order passes on both. Kept in en-US order (as in CI) with the rule off for this list.
		// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
		options: [
			{ name: 'CallTracking', value: 'callTracking' },
			{ name: 'CPA', value: 'cpa' },
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
		],
	},
];
