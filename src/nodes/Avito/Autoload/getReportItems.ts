import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { avitoApiRequest, validateRequiredFields } from '../GenericFunctions';
import { getErrorMessage } from '../types/AvitoTypes';
import type { PaginatedQueryParams, ReportItemsFilters, ReportItemsResponse } from '../types/AvitoTypes';

/**
 * Детализированные результаты выгрузки объявлений с пагинацией
 * API: GET /autoload/v2/reports/{report_id}/items
 * Scope: autoload:reports
 * Пагинация: page/per_page (page с 0)
 */
export async function getReportItems(this: IExecuteFunctions, itemIndex: number) {
	const startTime = Date.now();

	// Базовые параметры
	const reportId = this.getNodeParameter('reportId', itemIndex) as number;
	const page = this.getNodeParameter('itemsPage', itemIndex) as number;
	const perPage = this.getNodeParameter('itemsPerPage', itemIndex) as number;

	// Дополнительные фильтры
	const filters = this.getNodeParameter('itemsFilters', itemIndex, {}) as ReportItemsFilters;

	// Параметры пагинации
	const enablePagination = this.getNodeParameter('itemsEnablePagination', itemIndex, false) as boolean;
	const paginationType = this.getNodeParameter('itemsPaginationType', itemIndex, 'all') as 'all' | 'limit';
	const maxPages = this.getNodeParameter('itemsMaxPages', itemIndex, 20) as number;

	// Валидация
	validateRequiredFields.call(this, this, itemIndex, { reportId });

	if (page < 0) {
		throw new NodeOperationError(this.getNode(), 'Номер страницы должен быть больше или равен 0', { itemIndex });
	}
	if (perPage < 1 || perPage > 200) {
		throw new NodeOperationError(this.getNode(), 'Количество на странице должно быть от 1 до 200', { itemIndex });
	}

	// Формируем параметры запроса
	const queryParams: PaginatedQueryParams = { page, per_page: perPage };
	if (filters.query) queryParams.query = filters.query;
	if (filters.sections) queryParams.sections = filters.sections;

	// Если пагинация отключена - выполняем простой запрос
	if (!enablePagination) {
		return await executeSingleItemsRequest(this, reportId, queryParams, itemIndex, startTime);
	}

	// Выполняем пагинированный запрос
	return await executePaginatedItemsRequest(
		this,
		reportId,
		queryParams,
		paginationType,
		maxPages,
		itemIndex,
		startTime,
	);
}

/**
 * Выполнение одного запроса объявлений (без пагинации)
 */
async function executeSingleItemsRequest(
	context: IExecuteFunctions,
	reportId: number,
	queryParams: PaginatedQueryParams,
	itemIndex: number,
	startTime: number,
): Promise<IDataObject> {
	// ✅ ИСПРАВЛЕНО: Правильная версия API v2 вместо v1
	const response = await avitoApiRequest.call(
		context,
		'GET',
		`/autoload/v2/reports/${reportId}/items`,
		undefined,
		queryParams,
		itemIndex,
	) as ReportItemsResponse;

	if (!response || !Array.isArray(response.items)) {
		throw new NodeOperationError(context.getNode(), 'Получен некорректный ответ от Avito API', {
			itemIndex,
		});
	}

	const executionTime = Date.now() - startTime;

	return {
		...(response as Record<string, unknown>),
		meta: {
			...(response.meta as Record<string, unknown> || {}),
			pagination_enabled: false,
			execution_time_ms: executionTime,
			single_request: true,
		},
	};
}

/**
 * Выполнение пагинированного запроса объявлений
 */
async function executePaginatedItemsRequest(
	context: IExecuteFunctions,
	reportId: number,
	baseQueryParams: PaginatedQueryParams,
	paginationType: 'all' | 'limit',
	maxPages: number,
	itemIndex: number,
	startTime: number,
): Promise<IDataObject> {
	let currentPage = baseQueryParams.page ?? 0;
	let pageCount = 0;
	const allItems: IDataObject[] = [];
	let totalAvailable: number | null = null;
	let totalPages: number | null = null;

	// Определяем макс. число страниц
	const effectiveMaxPages = paginationType === 'all' ? 1000 : Math.min(maxPages, 1000);

	try {
		while (pageCount < effectiveMaxPages) {
			const queryParams = {
				...baseQueryParams,
				page: currentPage,
			};

			// ✅ ИСПРАВЛЕНО: Правильная версия API v2 вместо v1
			const response = await avitoApiRequest.call(
				context,
				'GET',
				`/autoload/v2/reports/${reportId}/items`,  // Было: `/autoload/v1/reports/${reportId}/items`
				undefined,
				queryParams,
				itemIndex,
			) as ReportItemsResponse;

			if (!response || !Array.isArray(response.items)) {
				break;
			}

			// Сохраняем мета-информацию из первого запроса
			if (pageCount === 0) {
				const meta = response.meta as Record<string, unknown> | undefined;
				totalAvailable = (meta?.total as number) || null;
				totalPages = (meta?.pages as number) || null;
			}

			allItems.push(...(response.items as IDataObject[]));
			pageCount++;

			// Проверяем условия остановки
			const receivedCount = response.items?.length ?? 0;
			const isLastPage = receivedCount < (baseQueryParams.per_page ?? 50);
			
			if (isLastPage) {
				break;
			}

			if (totalPages !== null && currentPage >= totalPages - 1) {
				break;
			}

			currentPage++;
		}

		const executionTime = Date.now() - startTime;

		return {
			items: allItems,
			meta: {
				pagination_enabled: true,
				pagination_type: paginationType,
				pages_processed: pageCount,
				start_page: baseQueryParams.page,
				current_page: currentPage,
				per_page: baseQueryParams.per_page,
				total_fetched: allItems.length,
				total_available: totalAvailable,
				total_pages: totalPages,
				execution_time_ms: executionTime,
				max_pages_reached: pageCount >= effectiveMaxPages,
			},
		};
	} catch (error: unknown) {
		if (error instanceof NodeOperationError) {
			throw new NodeOperationError(context.getNode(), error.message, { itemIndex });
		}

		throw new NodeOperationError(
			context.getNode(),
			'Критическая ошибка при выполнении пагинированного запроса объявлений',
			{
				itemIndex,
				description: `${getErrorMessage(error)}. Получено ${allItems.length} объявлений до ошибки.`,
			},
		);
	}
}
