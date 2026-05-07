import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { avitoApiRequest, validateRequiredFields } from '../GenericFunctions';
import { getErrorMessage } from '../types/AvitoTypes';
import type { PaginatedQueryParams, ReportItemsFeesFilters, ReportItemsResponse } from '../types/AvitoTypes';

/**
 * Информация о списаниях за размещение объявлений с пагинацией
 * API: GET /autoload/v2/reports/{report_id}/items/fees
 * Scope: autoload:reports
 * Пагинация: page/per_page (ОСОБЕННОСТЬ: page с 0!)
 */
export async function getReportItemsFees(this: IExecuteFunctions, itemIndex: number) {
	const startTime = Date.now();

	// Базовые параметры
	const reportId = this.getNodeParameter('reportId', itemIndex) as number;
	const page = this.getNodeParameter('feesPage', itemIndex) as number;
	const perPage = this.getNodeParameter('feesPerPage', itemIndex) as number;

	// Дополнительные фильтры
	const filters = this.getNodeParameter('feesFilters', itemIndex, {}) as ReportItemsFeesFilters;

	// Параметры пагинации
	const enablePagination = this.getNodeParameter('feesEnablePagination', itemIndex, false) as boolean;

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
	if (filters.ad_ids) queryParams.ad_ids = filters.ad_ids;
	if (filters.avito_ids) queryParams.avito_ids = filters.avito_ids;

	// Если пагинация отключена - выполняем простой запрос
	if (!enablePagination) {
		return await executeSingleFeesRequest(this, reportId, queryParams, itemIndex, startTime);
	}

	// Выполняем пагинированный запрос (простая логика для fees)
	return await executePaginatedFeesRequest(
		this,
		reportId,
		queryParams,
		itemIndex,
		startTime,
	);
}

/**
 * Выполнение одного запроса списаний (без пагинации)
 */
async function executeSingleFeesRequest(
	context: IExecuteFunctions,
	reportId: number,
	queryParams: PaginatedQueryParams,
	itemIndex: number,
	startTime: number,
): Promise<IDataObject> {
	const response = await avitoApiRequest.call(
		context,
		'GET',
		`/autoload/v2/reports/${reportId}/items/fees`,
		undefined,
		queryParams,
		itemIndex,
	) as ReportItemsResponse;

	if (!response || !Array.isArray(response.fees)) {
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
			page_starts_from_zero: true,
		},
	};
}

/**
 * Выполнение пагинированного запроса списаний
 * Особенность: page начинается с 0
 */
async function executePaginatedFeesRequest(
	context: IExecuteFunctions,
	reportId: number,
	baseQueryParams: PaginatedQueryParams,
	itemIndex: number,
	startTime: number,
): Promise<IDataObject> {
	let currentPage = baseQueryParams.page ?? 0; // Начинаем с указанной страницы (может быть 0)
	let pageCount = 0;
	const allFees: IDataObject[] = [];
	let totalAvailable: number | null = null;
	let totalPages: number | null = null;

	const maxPages = 100; // Разумный лимит для автоматической пагинации

	try {
		while (pageCount < maxPages) {
			const queryParams = {
				...baseQueryParams,
				page: currentPage,
			};

			const response = await avitoApiRequest.call(
				context,
				'GET',
				`/autoload/v2/reports/${reportId}/items/fees`,
				undefined,
				queryParams,
				itemIndex,
			) as ReportItemsResponse;

			if (!response || !Array.isArray(response.fees)) {
				break;
			}

			// Сохраняем мета-информацию из первого запроса
			if (pageCount === 0) {
				const meta = response.meta as Record<string, unknown> | undefined;
				totalAvailable = (meta?.total as number) || null;
				totalPages = (meta?.pages as number) || null;
			}

			allFees.push(...(response.fees as IDataObject[]));
			pageCount++;

			// Проверяем условия остановки
			const receivedCount = response.fees?.length ?? 0;
			const isLastPage = receivedCount < (baseQueryParams.per_page ?? 100);
			
			if (isLastPage) {
				break;
			}

			if (totalPages !== null && currentPage >= (totalPages - 1)) { // -1 потому что страницы с 0
				break;
			}

			currentPage++;
		}

		const executionTime = Date.now() - startTime;

		return {
			fees: allFees,
			meta: {
				pagination_enabled: true,
				pages_processed: pageCount,
				start_page: baseQueryParams.page,
				current_page: currentPage,
				per_page: baseQueryParams.per_page,
				total_fetched: allFees.length,
				total_available: totalAvailable,
				total_pages: totalPages,
				execution_time_ms: executionTime,
				page_starts_from_zero: true,
				max_pages_reached: pageCount >= maxPages,
			},
		};
	} catch (error: unknown) {
		if (error instanceof NodeOperationError) {
			throw new NodeOperationError(context.getNode(), error.message, { itemIndex });
		}

		throw new NodeOperationError(
			context.getNode(),
			'Критическая ошибка при выполнении пагинированного запроса списаний',
			{
				itemIndex,
				description: `${getErrorMessage(error)}. Получено ${allFees.length} записей о списаниях до ошибки.`,
			},
		);
	}
}
