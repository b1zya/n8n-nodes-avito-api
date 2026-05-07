import type { INodeProperties } from 'n8n-workflow';

export const userOperations: INodeProperties[] = [
	{
		displayName: 'Операция',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['user'] } },
		default: 'getUserInfoSelf',
		options: [
			{
				name: 'Баланс Кошелька',
				value: 'getUserBalance',
				description: 'Получение баланса кошелька пользователя: реальные деньги и бонусы',
				action: 'Get user wallet balance',
			},
			{
				name: 'Информация Об Авторизованном Пользователе',
				value: 'getUserInfoSelf',
				description: 'Получение идентификатора и регистрационных данных авторизованного пользователя',
				action: 'Get authorized user information',
			},
			{
				name: 'История Операций',
				value: 'postOperationsHistory',
				description: 'Получение истории операций кошелька за период до одной недели',
				action: 'Get user operations history',
			},
		],
	},
];

export const userFields: INodeProperties[] = [
	{
		displayName: 'ID Пользователя',
		name: 'userId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Идентификатор пользователя (клиента)',
		typeOptions: {
			minValue: 1,
		},
		displayOptions: { show: { resource: ['user'], operation: ['getUserBalance'] } },
	},
	{
		displayName: 'Дата И Время От',
		name: 'userOperationsDateTimeFrom',
		type: 'dateTime',
		required: true,
		default: '',
		description: 'Начало периода истории операций. По документации не далее одного года в прошлое.',
		displayOptions: { show: { resource: ['user'], operation: ['postOperationsHistory'] } },
	},
	{
		displayName: 'Дата И Время До',
		name: 'userOperationsDateTimeTo',
		type: 'dateTime',
		required: true,
		default: '',
		description: 'Конец периода истории операций. Диапазон между датами должен быть не более одной недели.',
		displayOptions: { show: { resource: ['user'], operation: ['postOperationsHistory'] } },
	},
	{
		displayName: '<b>Информация о User API Avito</b><br><br><b>Методы:</b><br>• <code>GET /core/v1/accounts/self</code> - данные авторизованного пользователя<br>• <code>GET /core/v1/accounts/{user_id}/balance/</code> - текущий баланс кошелька<br>• <code>POST /core/v1/accounts/operations_history/</code> - история операций кошелька<br><br><b>Scopes:</b><br>• <code>user:read</code> - информация о пользователе<br>• <code>user_balance:read</code> - баланс кошелька<br>• <code>user_operations:read</code> - история операций<br><br><b>Важно:</b> CPA-баланс находится в отдельном ресурсе CPA и запрашивается через <code>/cpa/v3/balanceInfo</code>.',
		name: 'userInfoNotice',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['user'] } },
	},
];
