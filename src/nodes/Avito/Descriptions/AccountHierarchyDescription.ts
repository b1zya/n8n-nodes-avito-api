import type { INodeProperties } from 'n8n-workflow';

export const accountHierarchyOperations: INodeProperties[] = [
	{
		displayName: 'Операция',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['accountHierarchy'] } },
		default: 'getAhInfo',
		options: [
			{
				name: 'Объявления Сотрудника',
				value: 'listItemsByEmployee',
				description: 'Список объявлений сотрудника с фильтром по категории',
				action: 'List account hierarchy items by employee',
			},
			{
				name: 'Полная Информация О Статусе',
				value: 'getAhInfo',
				description: 'Сведения о компании и список сотрудников, к которым принадлежит пользователь',
				action: 'Get complete account hierarchy info',
			},
			{
				name: 'Прикрепить Объявления К Сотруднику',
				value: 'linkItems',
				description: 'Прикрепление или перезакрепление до 50 объявлений на сотрудника',
				action: 'Link items to an account hierarchy employee',
			},
			{
				name: 'Сотрудники Иерархии',
				value: 'getEmployees',
				description: 'Список сотрудников компании с именами, email и телефонами',
				action: 'Get account hierarchy employees',
			},
			{
				name: 'Статус Пользователя',
				value: 'checkAhUser',
				description: 'Проверка, является ли пользователь компанией, руководителем или сотрудником',
				action: 'Check account hierarchy user status',
			},
			{
				name: 'Телефоны Компании',
				value: 'listCompanyPhones',
				description: 'Список телефонов компании с курсорной пагинацией',
				action: 'List account hierarchy company phones',
			},
		],
	},
];

export const accountHierarchyFields: INodeProperties[] = [
	{
		displayName: 'ID Компании (X-Employee-Of)',
		name: 'accountHierarchyEmployeeOf',
		type: 'number',
		default: 0,
		description:
			'Идентификатор компании, от имени которой работает сотрудник. Оставьте 0, если запрос идет от лица компании и заголовок не нужен.',
		hint: 'По спецификации Avito заголовок принимают только эти четыре операции. Устаревший X-Is-Employee не используется.',
		typeOptions: {
			minValue: 0,
		},
		displayOptions: {
			show: {
				resource: ['accountHierarchy'],
				operation: ['checkAhUser', 'getEmployees', 'listCompanyPhones', 'listItemsByEmployee'],
			},
		},
	},
	{
		displayName: 'ID Сотрудника',
		name: 'accountHierarchyEmployeeId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Идентификатор сотрудника иерархии, полученный из операции "Сотрудники Иерархии"',
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['accountHierarchy'],
				operation: ['linkItems', 'listItemsByEmployee'],
			},
		},
	},
	{
		displayName: 'ID Объявлений',
		name: 'accountHierarchyItemIds',
		type: 'string',
		required: true,
		default: '',
		description: 'Список ID объявлений через запятую. По документации Avito максимум 50 за запрос.',
		placeholder: '1023900,1090112,3610765',
		displayOptions: {
			show: { resource: ['accountHierarchy'], operation: ['linkItems'] },
		},
	},
	{
		displayName: 'ID Категории',
		name: 'accountHierarchyCategoryId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Идентификатор категории объявлений для фильтрации',
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: { resource: ['accountHierarchy'], operation: ['listItemsByEmployee'] },
		},
	},
	{
		displayName: 'ID Последнего Объявления',
		name: 'accountHierarchyLastItemId',
		type: 'number',
		default: 0,
		description:
			'Курсор пагинации. Оставьте 0 для первой страницы, дальше передавайте последний ID из предыдущего ответа, пока hasNext равен true.',
		typeOptions: {
			minValue: 0,
		},
		displayOptions: {
			show: { resource: ['accountHierarchy'], operation: ['listItemsByEmployee'] },
		},
	},
	{
		displayName: 'Курсор',
		name: 'accountHierarchyCursor',
		type: 'string',
		default: '',
		description:
			'Курсор следующей страницы из поля result.cursor предыдущего ответа. Если Avito не вернул cursor, список закончился.',
		displayOptions: {
			show: { resource: ['accountHierarchy'], operation: ['listCompanyPhones'] },
		},
	},
];
