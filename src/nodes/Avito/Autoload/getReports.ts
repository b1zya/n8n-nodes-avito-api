import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError, sleep } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';
import { getErrorMessage } from '../types/AvitoTypes';
import type { PaginatedQueryParams, ReportsFilters, ReportsResponse } from '../types/AvitoTypes';

/**
 * Получение списка отчетов автозагрузки с пагинацией
 * API: GET /autoload/v2/reports
 * Scope: autoload:reports
 *
 * @deprecated Avito выводит метод из эксплуатации (getReportsV2).
 * 08.09.2026 данные старше 7 дней станут неполными, 08.03.2027 метод удаляют (410 Gone).
 * Замена: getUploads (GET /autoload/v4/uploads).
 * Пагинация: page/per_page (page с 0)
 */
export async function getReports(this: IExecuteFunctions, itemIndex: number) {
	const startTime = Date.now();

	// Базовые параметры
	const page = this.getNodeParameter('page', itemIndex) as number;
	const perPage = this.getNodeParameter('perPage', itemIndex) as number;
	const filters = this.getNodeParameter('reportsFilters', itemIndex, {}) as ReportsFilters;

	// Параметры пагинации
	const enablePagination = this.getNodeParameter('enablePagination', itemIndex, false) as boolean;
	const paginationType = this.getNodeParameter('paginationType', itemIndex, 'all') as 'all' | 'limit';
	const maxPages = this.getNodeParameter('maxPages', itemIndex, 10) as number;
	const enableDelay = this.getNodeParameter('enableDelay', itemIndex, false) as boolean;
	const requestDelay = this.getNodeParameter('requestDelay', itemIndex, 200) as number;

	// Валидация параметров
	if (page < 0) {
		throw new NodeOperationError(this.getNode(), 'Номер страницы должен быть больше или равен 0', { itemIndex });
	}
	if (perPage < 1 || perPage > 200) {
		throw new NodeOperationError(this.getNode(), 'Количество на странице должно быть от 1 до 200', { itemIndex });
	}

	const queryParams: PaginatedQueryParams = { page, per_page: perPage };
	if (filters.date_from) queryParams.date_from = filters.date_from;
	if (filters.date_to) queryParams.date_to = filters.date_to;

	// Если пагинация отключена - выполняем простой запрос
	if (!enablePagination) {
		return await executeSingleReportsRequest(this, queryParams, itemIndex, startTime);
	}

	// Выполняем пагинированный запрос
	return await executePaginatedReportsRequest(
		this,
		queryParams,
		paginationType,
		maxPages,
		enableDelay,
		requestDelay,
		itemIndex,
		startTime,
	);
}

/**
 * Выполнение одного запроса отчетов (без пагинации)
 */
async function executeSingleReportsRequest(
	context: IExecuteFunctions,
	queryParams: PaginatedQueryParams,
	itemIndex: number,
	startTime: number,
): Promise<IDataObject> {
	const response = await avitoApiRequest.call(
		context,
		'GET',
		'/autoload/v2/reports',
		undefined,
		queryParams,
		itemIndex,
	) as ReportsResponse;

	if (!response || !Array.isArray(response.reports)) {
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
 * Выполнение пагинированного запроса отчетов
 */
async function executePaginatedReportsRequest(
	context: IExecuteFunctions,
	baseQueryParams: PaginatedQueryParams,
	paginationType: 'all' | 'limit',
	maxPages: number,
	enableDelay: boolean,
	requestDelay: number,
	itemIndex: number,
	startTime: number,
): Promise<IDataObject> {
	let currentPage = baseQueryParams.page ?? 0;
	let pageCount = 0;
	const allReports: IDataObject[] = [];
	let totalAvailable: number | null = null;
	let totalPages: number | null = null;

	// Определяем макс. число страниц
	const effectiveMaxPages = paginationType === 'all' ? 1000 : Math.min(maxPages, 1000);

	try {
		while (pageCount < effectiveMaxPages) {
			// Применяем задержку (кроме первого запроса)
			if (enableDelay && pageCount > 0 && requestDelay > 0) {
				await sleep(requestDelay);
			}

			const response = await avitoApiRequest.call(
				context,
				'GET',
				'/autoload/v2/reports',
				undefined,
				{ ...baseQueryParams, page: currentPage },
				itemIndex,
			) as ReportsResponse;

			if (!response || !Array.isArray(response.reports)) {
				break;
			}

			// Сохраняем мета-информацию из первого запроса
			if (pageCount === 0) {
				const meta = response.meta as Record<string, unknown> | undefined;
				totalAvailable = (meta?.total as number) || null;
				totalPages = (meta?.pages as number) || null;
			}

			allReports.push(...(response.reports as IDataObject[]));
			pageCount++;

			// Проверяем условия остановки
			const receivedCount = response.reports.length;
			const isLastPage = receivedCount < (baseQueryParams.per_page ?? 50);
			
			// Останавливаемся если получили меньше записей чем лимит
			if (isLastPage) {
				break;
			}

			// Останавливаемся если достигли общего количества страниц
			if (totalPages !== null && currentPage >= totalPages - 1) {
				break;
			}

			currentPage++;
		}

		const executionTime = Date.now() - startTime;

		return {
			reports: allReports,
			meta: {
				pagination_enabled: true,
				pagination_type: paginationType,
				pages_processed: pageCount,
				start_page: baseQueryParams.page,
				current_page: currentPage,
				per_page: baseQueryParams.per_page,
				total_fetched: allReports.length,
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
			'Критическая ошибка при выполнении пагинированного запроса отчетов',
			{
				itemIndex,
				description: `${getErrorMessage(error)}. Получено ${allReports.length} отчетов до ошибки.`,
			},
		);
	}
}
