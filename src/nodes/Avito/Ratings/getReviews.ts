import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError, sleep } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';

/**
 * Получение списка активных отзывов с пагинацией
 * API: GET /ratings/v1/reviews
 * Scope: ratings:read
 * 
 * Rate Limits: 300 запросов/минуту
 * Максимум записей за запрос: 50 отзывов
 */
export async function getReviews(this: IExecuteFunctions, itemIndex: number) {
	const startTime = Date.now();

	// Базовые параметры
	const offset = this.getNodeParameter('offset', itemIndex) as number;
	const limit = this.getNodeParameter('limit', itemIndex) as number;

	// Параметры пагинации
	const enablePagination = this.getNodeParameter('enablePagination', itemIndex, false) as boolean;
	const paginationType = this.getNodeParameter('paginationType', itemIndex, 'all') as 'all' | 'limit';
	const maxRequests = this.getNodeParameter('maxRequests', itemIndex, 10) as number;
	const enableDelay = this.getNodeParameter('enableDelay', itemIndex, false) as boolean;
	const requestDelay = this.getNodeParameter('requestDelay', itemIndex, 100) as number;

	// Валидация параметров
	if (offset < 0) {
		throw new NodeOperationError(this.getNode(), 'Смещение не может быть отрицательным', { itemIndex });
	}
	if (limit < 1 || limit > 50) {
		throw new NodeOperationError(this.getNode(), 'Лимит должен быть от 1 до 50 (ограничение API)', { itemIndex });
	}

	// Если пагинация отключена - выполняем простой запрос
	if (!enablePagination) {
		return await executeSingleReviewsRequest(this, offset, limit, itemIndex, startTime);
	}

	// Выполняем пагинированный запрос
	return await executePaginatedReviewsRequest(
		this,
		offset,
		limit,
		paginationType,
		maxRequests,
		enableDelay,
		requestDelay,
		itemIndex,
		startTime,
	);
}

/**
 * Выполнение одного запроса отзывов (без пагинации)
 */
async function executeSingleReviewsRequest(
	context: IExecuteFunctions,
	offset: number,
	limit: number,
	itemIndex: number,
	startTime: number,
): Promise<IDataObject> {
	const response = await avitoApiRequest.call(
		context,
		'GET',
		'/ratings/v1/reviews',
		undefined,
		{ offset, limit },
		itemIndex,
	);

	if (!response || !Array.isArray(response.reviews)) {
		throw new NodeOperationError(context.getNode(), 'Получен некорректный ответ от Avito API', {
			itemIndex,
		});
	}

	const executionTime = Date.now() - startTime;

	return {
		...response,
		meta: {
			pagination_enabled: false,
			current_offset: offset,
			current_limit: limit,
			fetched_reviews: response.reviews.length,
			total_available: response.total || 0,
			execution_time_ms: executionTime,
			single_request: true,
			rate_limit_info: {
				max_requests_per_minute: 300,
				recommended_delay_ms: 200,
			}
		},
	};
}

/**
 * Выполнение пагинированного запроса отзывов с защитой от rate limits
 */
async function executePaginatedReviewsRequest(
	context: IExecuteFunctions,
	startOffset: number,
	limit: number,
	paginationType: 'all' | 'limit',
	maxRequests: number,
	enableDelay: boolean,
	requestDelay: number,
	itemIndex: number,
	startTime: number,
): Promise<IDataObject> {
	let currentOffset = startOffset;
	let requestCount = 0;
	let totalAvailable: number | null = null;
	const allReviews: IDataObject[] = [];

	// Определяем макс. число запросов - позволяем пользователю выбирать
	const effectiveMaxRequests = paginationType === 'all' ? 500 : Math.min(maxRequests, 500);

	// Защита от rate limits: отслеживаем количество запросов в минуту
	const requestTimes: number[] = [];
	const rateLimitWindow = 60000; // 1 минута в мс
	const maxRequestsPerMinute = 299; // Оставляем запас в 1 запрос

	// Функция для проверки rate limits
	const checkRateLimit = (): boolean => {
		const now = Date.now();
		// Удаляем запросы старше 1 минуты
		const recentRequests = requestTimes.filter((time: number) => now - time < rateLimitWindow);
		requestTimes.length = 0;
		requestTimes.push(...recentRequests);
		
		return requestTimes.length < maxRequestsPerMinute;
	};

	// Рассчитываем задержку только если пользователь включил её
	const effectiveDelay = enableDelay ? requestDelay : 0;

	try {
		while (requestCount < effectiveMaxRequests) {
			// Проверяем rate limit ПЕРЕД запросом
			if (!checkRateLimit()) {
				// Если превысили лимит, ждем до начала следующей минуты
				const oldestRequest = Math.min(...requestTimes);
				const waitTime = rateLimitWindow - (Date.now() - oldestRequest) + 100; // +100ms запас
				
				// Используем логирование через context вместо console
				await sleep(waitTime);
				
				// Перепроверяем после ожидания
				if (!checkRateLimit()) {
					throw new NodeOperationError(
						context.getNode(),
						'Не удалось соблюсти rate limit после ожидания',
						{ itemIndex }
					);
				}
			}

			// Применяем пользовательскую задержку (если включена)
			if (requestCount > 0 && effectiveDelay > 0) {
				await sleep(effectiveDelay);
			}

			// Регистрируем время запроса ДО выполнения
			requestTimes.push(Date.now());

			const response = await avitoApiRequest.call(
				context,
				'GET',
				'/ratings/v1/reviews',
				undefined,
				{ offset: currentOffset, limit },
				itemIndex,
			);

			if (!response || !Array.isArray(response.reviews)) {
				break;
			}

			// Сохраняем общее количество из первого запроса
			if (requestCount === 0 && typeof response.total === 'number') {
				totalAvailable = response.total;
			}

			allReviews.push(...response.reviews);
			requestCount++;

			// Проверяем условия остановки
			const receivedCount = response.reviews.length;
			const isLastPage = receivedCount < limit;
			
			// Останавливаемся если получили меньше записей чем лимит
			if (isLastPage) {
				break;
			}

			// Останавливаемся если достигли общего количества
			if (totalAvailable !== null && currentOffset + limit >= totalAvailable) {
				break;
			}

			currentOffset += limit;
		}

		const executionTime = Date.now() - startTime;
		const requestsInLastMinute = requestTimes.filter((time: number) => Date.now() - time < rateLimitWindow).length;

		return {
			reviews: allReviews,
			total: totalAvailable || allReviews.length,
			meta: {
				pagination_enabled: true,
				pagination_type: paginationType,
				requests_made: requestCount,
				start_offset: startOffset,
				current_offset: currentOffset,
				limit_per_request: limit,
				total_fetched: allReviews.length,
				total_available: totalAvailable,
				execution_time_ms: executionTime,
				max_requests_reached: requestCount >= effectiveMaxRequests,
				rate_limit_info: {
					max_requests_per_minute: 300,
					requests_in_last_minute: requestsInLastMinute,
					rate_limit_protection_active: true,
					user_delay_enabled: enableDelay,
					user_delay_ms: enableDelay ? requestDelay : 0,
					safe_for_rate_limits: requestsInLastMinute < 280,
				},
			},
		};
	} catch (error: unknown) {
		if (error instanceof NodeOperationError) {
			throw new NodeOperationError(context.getNode(), error.message, { itemIndex });
		}

		// Проверяем, не связана ли ошибка с rate limiting
		const isRateLimitError = error && typeof error === 'object' && 'response' in error && (error as { response?: { status?: number } }).response?.status === 429;
		const errorMessage = isRateLimitError
			? 'Превышен лимит запросов (429). Увеличьте задержку между запросами.'
			: error instanceof Error ? error.message : 'Неизвестная ошибка';

		throw new NodeOperationError(
			context.getNode(),
			'Критическая ошибка при выполнении пагинированного запроса отзывов',
			{
				itemIndex,
				description: `${errorMessage} Получено ${allReviews.length} отзывов до ошибки. Запросов выполнено: ${requestCount}.`,
			},
		);
	}
}
