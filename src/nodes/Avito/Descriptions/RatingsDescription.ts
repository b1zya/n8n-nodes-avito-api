import type { INodeProperties } from 'n8n-workflow';

export const ratingsOperations: INodeProperties[] = [
	{
		displayName: 'Операция',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['ratings'] } },
		default: 'getRatingInfo',
		options: [
			{
				name: 'Информация О Рейтинге',
				value: 'getRatingInfo',
				description: 'Получение информации о рейтинге пользователя',
				action: 'Get rating information',
			},
			{
				name: 'Список Отзывов',
				value: 'getReviews',
				description: 'Получение списка активных отзывов с пагинацией',
				action: 'Get reviews list',
			},
			{
				name: 'Ответить На Отзыв',
				value: 'createAnswer',
				description: 'Отправка ответа на отзыв',
				action: 'Create review answer',
			},
			{
				name: 'Удалить Ответ',
				value: 'removeAnswer',
				description: 'Запрос на удаление ответа на отзыв',
				action: 'Remove review answer',
			},
		],
	},
];

export const ratingsFields: INodeProperties[] = [
	// ===== ПОЛЯ ДЛЯ getReviews (ПАГИНАЦИЯ) =====
	{
		displayName: 'Смещение',
		name: 'offset',
		type: 'number',
		required: true,
		description: 'Смещение для пагинации (начиная с 0)',
		default: 0,
		typeOptions: {
			minValue: 0,
		},
		displayOptions: { show: { resource: ['ratings'], operation: ['getReviews'] } },
	},
	{
		displayName: 'Лимит',
		name: 'limit',
		type: 'number',
		required: true,
		description: 'Max number of results to return',
		default: 50,
		typeOptions: {
			minValue: 1,
			maxValue: 50,
		},
		displayOptions: { show: { resource: ['ratings'], operation: ['getReviews'] } },
	},

	// Настройки пагинации для getReviews
	{
		displayName: 'Включить Автоматическую Пагинацию',
		name: 'enablePagination',
		type: 'boolean',
		default: false,
		description: 'Whether to fetch all reviews (enable pagination',
		hint: 'При включении будет выполнено несколько запросов для получения всех отзывов. Встроенная защита от превышения лимита 300 запросов/минуту.',
		displayOptions: { show: { resource: ['ratings'], operation: ['getReviews'] } },
	},
	{
		displayName: 'Тип Пагинации',
		name: 'paginationType',
		type: 'options',
		options: [
			{
				name: 'Получить Все Отзывы',
				value: 'all',
				description: 'Автоматически получить все доступные отзывы до конца',
			},
			{
				name: 'Лимит Запросов',
				value: 'limit',
				description: 'Ограничить количество запросов для получения отзывов',
			},
		],
		default: 'all',
		description: 'Выберите способ пагинации отзывов',
		displayOptions: {
			show: {
				resource: ['ratings'],
				operation: ['getReviews'],
				enablePagination: [true],
			},
		},
	},
	{
		displayName: 'Максимум Запросов',
		name: 'maxRequests',
		type: 'number',
		default: 10,
		description: 'Максимальное количество запросов пагинации (защита от бесконечного цикла)',
		hint: 'Каждый запрос может получить до 50 отзывов. 10 запросов = до 500 отзывов. Встроенная защита от превышения лимита 300 запросов/минуту.',
		typeOptions: {
			minValue: 1,
			maxValue: 500,
		},
		displayOptions: {
			show: {
				resource: ['ratings'],
				operation: ['getReviews'],
				enablePagination: [true],
				paginationType: ['limit'],
			},
		},
	},
	{
		displayName: 'Включить Задержку Запросов',
		name: 'enableDelay',
		type: 'boolean',
		default: false,
		description: 'Whether to add a delay between requests',
		displayOptions: {
			show: {
				resource: ['ratings'],
				operation: ['getReviews'],
				enablePagination: [true],
			},
		},
	},
	{
		displayName: 'Задержка (мс)',
		name: 'requestDelay',
		type: 'number',
		default: 100,
		description: 'Задержка между запросами в миллисекундах',
		hint: 'Рекомендуется 200+ мс для быстрой работы при больших объемах. Без задержки: автозащита может добавлять паузы.',
		typeOptions: {
			minValue: 0,
		},
		displayOptions: {
			show: {
				resource: ['ratings'],
				operation: ['getReviews'],
				enablePagination: [true],
				enableDelay: [true],
			},
		},
	},

	// ===== ПОЛЯ ДЛЯ createAnswer =====
	{
		displayName: 'ID Отзыва',
		name: 'reviewId',
		type: 'number',
		required: true,
		description: 'Уникальный ID отзыва для ответа',
		default: 0,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: { show: { resource: ['ratings'], operation: ['createAnswer'] } },
	},
	{
		displayName: 'Текст Ответа',
		name: 'answerText',
		type: 'string',
		required: true,
		description: 'Текст ответа на отзыв',
		default: '',
		placeholder: 'Спасибо за отзыв! Мы ценим ваше мнение и будем работать над улучшением.',
		typeOptions: {
			rows: 4,
		},
		displayOptions: { show: { resource: ['ratings'], operation: ['createAnswer'] } },
	},

	// ===== ПОЛЯ ДЛЯ removeAnswer =====
	{
		displayName: 'ID Ответа',
		name: 'answerId',
		type: 'number',
		required: true,
		description: 'Уникальный ID ответа на отзыв для удаления',
		default: 0,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: { show: { resource: ['ratings'], operation: ['removeAnswer'] } },
	},

	// ===== ИНФОРМАЦИОННЫЕ ПОДСКАЗКИ =====
	{
		displayName:
			'📋 <b>Информация о рейтингах Avito</b><br><br>🔐 <b>Требуемые разрешения:</b><br>• <b>ratings:read</b> - для получения информации и списка отзывов<br>• <b>ratings:write</b> - для создания и удаления ответов<br><br>📊 <b>Структура рейтинга:</b><br>• <b>score</b> - оценка рейтинга (float)<br>• <b>reviewsCount</b> - общее количество активных отзывов<br>• <b>reviewsWithScoreCount</b> - количество отзывов, влияющих на рейтинг<br><br>💡 <b>Особенности:</b><br>• Рейтинг может быть отключен (isEnabled: false)<br>• Не все отзывы влияют на формирование оценки<br>• Ответы на отзывы проходят модерацию',
		name: 'ratingsInfoNotice',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['ratings'], operation: ['getRatingInfo'] } },
	},
	{
		displayName:
			'📝 <b>Информация об отзывах и рекомендации по лимитам</b><br><br>🚦 <b>Rate Limits API Avito:</b><br>• <b>300 запросов в минуту</b> на аккаунт (для всех API)<br>• При превышении: HTTP 429 с заголовками X-RateLimit-*<br>• <b>Встроенная защита</b>: автоматическая пауза при приближении к лимиту<br><br>💡 <b>Рекомендации пользователю:</b><br>• <b>Включайте задержку 200+ мс</b> при пагинации для ускорения<br>• Без задержки: автозащита может добавлять паузы до 60 сек<br>• Для больших объемов (1000+ отзывов): задержка 250-500мс оптимальна<br><br>📄 <b>Пагинация отзывов:</b><br>• <b>Максимум 50 отзывов</b> за один запрос<br>• Используйте offset для перехода по страницам<br>• total показывает общее количество отзывов<br><br>📊 <b>Структура отзыва:</b><br>• <b>ID</b> - уникальный ID отзыва<br>• <b>score</b> - оценка (1-5 или null)<br>• <b>text</b> - текст отзыва<br>• <b>stage</b> - этап модерации<br>• <b>usedInScore</b> - влияет ли на рейтинг<br>• <b>canAnswer</b> - можно ли ответить<br>• <b>answer</b> - существующий ответ (если есть)<br><br>💬 <b>Дополнительно:</b><br>• sender - информация об отправителе<br>• item - информация об объявлении<br>• createdAt - дата создания (Unix timestamp)<br><br>⚡ <b>Примеры времени выполнения:</b><br>• 100 отзывов с задержкой 250ms: ~2 секунды<br>• 1000 отзывов с задержкой 250ms: ~5 секунд<br>• 1000 отзывов без задержки: ~5-65 секунд (зависит от автозащиты)',
		name: 'reviewsInfoNotice',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['ratings'], operation: ['getReviews'] } },
	},
	{
		displayName:
			'✍️ <b>Создание ответа на отзыв</b><br><br>📝 <b>Требования:</b><br>• Текст ответа обязателен<br>• Ответ должен соответствовать правилам Avito<br>• Можно отвечать только на отзывы с canAnswer: true<br><br>🔄 <b>Процесс модерации:</b><br>• <b>moderation</b> - ответ на модерации<br>• <b>published</b> - ответ опубликован<br>• <b>rejected</b> - ответ отклонен<br><br>💡 <b>Рекомендации:</b><br>• Отвечайте вежливо и конструктивно<br>• Избегайте спорных тем<br>• Благодарите за обратную связь<br>• Предлагайте решения проблем',
		name: 'createAnswerNotice',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['ratings'], operation: ['createAnswer'] } },
	},
	{
		displayName:
			'🗑️ <b>Удаление ответа на отзыв</b><br><br>⚠️ <b>Важно:</b><br>• Удаление ответа необратимо<br>• Можно удалить только свои ответы<br>• После удаления статистика может измениться<br><br>📋 <b>Процесс:</b><br>• Запрос отправляется на сервер<br>• Возвращается success: true при успехе<br>• В случае ошибки - детальное описание проблемы<br><br>💡 <b>Совет:</b><br>• Перед удалением убедитесь в правильности ID ответа<br>• Рассмотрите возможность редактирования вместо удаления',
		name: 'removeAnswerNotice',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['ratings'], operation: ['removeAnswer'] } },
	},
];
