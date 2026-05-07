import type {
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import { getErrorStatus } from './types/AvitoTypes';

/**
 * ✅ СТАНДАРТНАЯ реализация API запросов согласно рекомендациям разработчиков n8n
 * Использует httpRequestWithAuthentication вместо устаревшего requestOAuth2
 * Refresh по Avito 403 определяется в credential через tokenExpiredStatusCode.
 */

/**
 * Выполняет авторизованный запрос к Avito API
 * Generic функция для типобезопасных API responses
 * Следует стандартам n8n для OAuth2 интеграций
 *
 * @template T - Тип response (по умолчанию IDataObject)
 */
export async function avitoApiRequest<T extends IDataObject = IDataObject>(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject | Record<string, unknown> | string,
	qs?: IDataObject,
	itemIndex: number = 0,
	additionalHeaders?: IDataObject,
): Promise<T> {
	const options: IHttpRequestOptions = {
		method,
		url: `https://api.avito.ru${endpoint}`,
		headers: {
			'Content-Type': 'application/json',
			...additionalHeaders,
		},
		json: true,
		...(body && { body }),
		...(qs && { qs }),
	};

	try {
		return await this.helpers.httpRequestWithAuthentication.call(
			this,
			'avitoOAuth2Api',
			options,
			{
				oauth2: {
					includeCredentialsOnRefreshOnBody: true,
					tokenType: 'Bearer',
					// Avito requires Authorization: Bearer <token>. In n8n 2.19.x keepBearer=false
					// strips the "Bearer" prefix and causes 401 responses from Avito.
					keepBearer: true,
				},
			},
		);
	} catch (error: unknown) {
		const errorContext = { itemIndex };
		const errorStatus = getErrorStatus(error);

		if (errorStatus === 404) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				...errorContext,
				message: 'Resource not found',
				description: `The requested resource '${endpoint}' could not be found. Please check your parameters.`,
			});
		}

		if (errorStatus === 400) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				...errorContext,
				message: 'Bad request parameters',
				description: 'Please check that all required parameters are correct and properly formatted.',
			});
		}

		if (errorStatus === 429) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				...errorContext,
				message: 'Rate limit exceeded',
				description: 'Too many requests. Please try again later or add delay between requests.',
			});
		}

		throw new NodeApiError(this.getNode(), error as JsonObject, errorContext);
	}
}

/**
 * Стандартная валидация входных параметров
 * ✅ ИСПРАВЛЕНО: Добавлена проверка на undefined значения
 */
export function validateRequiredFields(
	context: IExecuteFunctions,
	itemIndex: number,
	fields: Record<string, unknown>
): void {
	for (const [fieldName, value] of Object.entries(fields)) {
		// ✅ ИСПРАВЛЕНО: Более строгая проверка значений
		if (value === undefined || value === null || value === '' ||
			(typeof value === 'number' && (isNaN(value) || value <= 0))) {
			throw new NodeOperationError(
				context.getNode(),
				`${fieldName} is required and must be a valid value`,
				{ itemIndex }
			);
		}
	}
}

/**
 * ✅ УЛУЧШЕНО: Валидация массива ID с предупреждением о пропущенных значениях
 * ✅ ИСПРАВЛЕНО: Добавлена проверка на undefined перед split()
 */
export function validateItemIds(
	context: IExecuteFunctions,
	itemIndex: number,
	itemIds: string,
	maxCount: number = 200
): number[] {
	// ✅ ИСПРАВЛЕНО: Проверка на undefined ДО вызова split()
	if (!itemIds || typeof itemIds !== 'string' || itemIds.trim() === '') {
		throw new NodeOperationError(
			context.getNode(),
			'Item IDs are required and must be a valid string',
			{ itemIndex }
		);
	}

	// ✅ БЕЗОПАСНЫЙ split() после проверки типа
	const rawIds = itemIds.split(',').map(s => s.trim());
	const validIds: number[] = [];
	const invalidIds: string[] = [];

	for (const rawId of rawIds) {
		const id = Number(rawId);
		if (!isNaN(id) && id > 0) {
			validIds.push(id);
		} else if (rawId !== '') { // Игнорируем пустые строки
			invalidIds.push(rawId);
		}
	}

	if (validIds.length === 0) {
		throw new NodeOperationError(
			context.getNode(),
			'At least one valid item ID is required',
			{ itemIndex }
		);
	}

	// ✅ УЛУЧШЕНО: Предупреждаем о пропущенных ID
	if (invalidIds.length > 0) {
		throw new NodeOperationError(
			context.getNode(),
			`Invalid item IDs found: ${invalidIds.join(', ')}`,
			{
				itemIndex,
				description: `Found ${validIds.length} valid IDs and ${invalidIds.length} invalid IDs. Please check your input.`
			}
		);
	}

	if (validIds.length > maxCount) {
		throw new NodeOperationError(
			context.getNode(),
			`Maximum ${maxCount} item IDs allowed per request`,
			{ itemIndex }
		);
	}

	return validIds;
}

/**
 * ✅ УЛУЧШЕНО: Валидация диапазона дат с проверкой будущих дат
 * ✅ ИСПРАВЛЕНО: Безопасная работа с датами
 */
export function validateDateRange(
	context: IExecuteFunctions,
	itemIndex: number,
	dateFrom: string,
	dateTo: string,
	maxDays: number = 270
): void {
	if (!dateFrom || !dateTo || typeof dateFrom !== 'string' || typeof dateTo !== 'string') {
		throw new NodeOperationError(
			context.getNode(),
			'Both start and end dates are required and must be valid strings',
			{ itemIndex }
		);
	}

	const startDate = new Date(dateFrom);
	const endDate = new Date(dateTo);
	const today = new Date();

	// ✅ ДОБАВЛЕНО: Проверка валидности дат
	if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
		throw new NodeOperationError(
			context.getNode(),
			'Invalid date format. Please use ISO format (YYYY-MM-DD)',
			{ itemIndex }
		);
	}

	if (startDate > endDate) {
		throw new NodeOperationError(
			context.getNode(),
			'Start date cannot be later than end date',
			{ itemIndex }
		);
	}

	// ✅ ДОБАВЛЕНО: Проверка будущих дат
	if (startDate > today) {
		throw new NodeOperationError(
			context.getNode(),
			'Start date cannot be in the future',
			{ itemIndex }
		);
	}

	const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
	if (daysDiff > maxDays) {
		throw new NodeOperationError(
			context.getNode(),
			`Date range is limited to ${maxDays} days`,
			{
				itemIndex,
				description: `Current range: ${daysDiff} days. Please select a shorter period.`
			}
		);
	}
}

/**
 * ✅ ДОБАВЛЕНО: Специфическая для Avito валидация параметров
 */
export function validateAvitoApiParams(
	context: IExecuteFunctions,
	itemIndex: number,
	params: {
		perPage?: number;
		page?: number;
		userId?: number;
		itemId?: number;
	}
): void {
	if (params.perPage !== undefined) {
		if (params.perPage < 1 || params.perPage >= 100) {
			throw new NodeOperationError(
				context.getNode(),
				'Items per page must be greater than 0 and less than 100',
				{ itemIndex }
			);
		}
	}

	if (params.page !== undefined && params.page < 1) {
		throw new NodeOperationError(
			context.getNode(),
			'Page number must be greater than 0',
			{ itemIndex }
		);
	}

	if (params.userId !== undefined && (!params.userId || params.userId <= 0)) {
		throw new NodeOperationError(
			context.getNode(),
			'User ID is required and must be greater than 0',
			{ itemIndex }
		);
	}

	if (params.itemId !== undefined && (!params.itemId || params.itemId <= 0)) {
		throw new NodeOperationError(
			context.getNode(),
			'Item ID is required and must be greater than 0',
			{ itemIndex }
		);
	}
}
