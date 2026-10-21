import type { INodeProperties } from 'n8n-workflow';

export const tariffOperations: INodeProperties[] = [
	{
		displayName: 'Операция',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['tariff'] } },
		default: 'getTariffInfo',
		options: [
			{
				name: 'Информация По Тарифу',
				value: 'getTariffInfo',
				description:
					'Получение информации по текущему и запланированному тарифу в категории Транспорт',
				action: 'Get tariff information',
			},
		],
	},
];

export const tariffFields: INodeProperties[] = [
	{
		displayName:
			'<b>Информация о Tariff API Avito</b><br><br><b>Метод:</b><br>• <code>GET /tariff/info/1</code> - информация по текущему и запланированному тарифу<br><br><b>Важно:</b><br>• Доступно только для тарифов в категории <b>Транспорт</b><br>• CPA-тарифы этим методом не возвращаются<br>• По документации метод авторизуется через <b>Client Credentials</b>',
		name: 'tariffInfoNotice',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['tariff'] } },
	},
];
