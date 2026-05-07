import type { IDataObject } from 'n8n-workflow';

/**
 * Helper для безопасного извлечения сообщения об ошибке
 */
export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === 'string') {
		return error;
	}
	if (error && typeof error === 'object' && 'message' in error) {
		return String(error.message);
	}
	return 'Unknown error';
}

/**
 * Helper для проверки HTTP статуса в ошибке
 */
export function getErrorStatus(error: unknown): number | undefined {
	if (error && typeof error === 'object' && 'response' in error) {
		const response = (error as { response?: { status?: number; statusCode?: number } }).response;
		return response?.status ?? response?.statusCode;
	}
	if (error && typeof error === 'object' && 'statusCode' in error) {
		return (error as { statusCode?: number }).statusCode;
	}
	if (error && typeof error === 'object' && 'status' in error) {
		return (error as { status?: number }).status;
	}
	return undefined;
}

/**
 * Параметры пагинации для API запросов
 */
export interface PaginatedQueryParams extends IDataObject {
	page?: number;
	per_page?: number;
	offset?: number;
	limit?: number;
}

/**
 * Динамическое тело запроса
 */
export type DynamicRequestBody = Record<string, unknown>;

/**
 * Данные дополнительных заголовков из UI
 */
export interface AdditionalHeadersData {
	parameter?: Array<{
		name: string;
		value: string;
	}>;
}

/**
 * Фильтры для report items
 */
export interface ReportItemsFilters {
	query?: string;
	sections?: string;
}

/**
 * Фильтры для report item fees
 */
export interface ReportItemsFeesFilters {
	ad_ids?: string;
	avito_ids?: string;
}

/**
 * Фильтры для reports
 */
export interface ReportsFilters {
	date_from?: string;
	date_to?: string;
}

/**
 * ============================================
 * API RESPONSE INTERFACES - Типизация для всех endpoints
 * ============================================
 */

/**
 * Ответ от analytics endpoint
 */
export interface AnalyticsResponse extends IDataObject {
	result?: {
		groupings?: Array<{
			grouping: string;
			data: unknown[];
		}>;
		dataTotalCount?: number;
	};
}

/**
 * Ответ от items endpoint
 */
export interface ItemsResponse extends IDataObject {
	items?: unknown[];
	total?: number;
	page?: number;
	per_page?: number;
}

/**
 * Ответ от reports endpoint (autoload)
 */
export interface ReportsResponse extends IDataObject {
	total?: number;
	pages?: number;
	items?: unknown[];
}

/**
 * Ответ от report items endpoint
 */
export interface ReportItemsResponse extends IDataObject {
	total?: number;
	pages?: number;
	items?: unknown[];
}

/**
 * Ответ от reviews endpoint
 */
export interface ReviewsResponse extends IDataObject {
	reviews?: unknown[];
	total?: number;
	pages?: number;
}
