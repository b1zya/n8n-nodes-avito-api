import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError, sleep } from 'n8n-workflow';

import { avitoApiRequest, validateAvitoApiParams } from '../GenericFunctions';
import type { PaginatedQueryParams, ItemsResponse } from '../types/AvitoTypes';
import { toYYYYMMDD } from '../utils/date_normalize';

export async function getItems(this: IExecuteFunctions, itemIndex: number) {
	const startTime = Date.now();

	// === ПОЛУЧЕНИЕ ПАРАМЕТРОВ ===

	// Базовые параметры
	const perPage = this.getNodeParameter('perPage', itemIndex, 25) as number;
	const startPage = this.getNodeParameter('page', itemIndex, 1) as number;
	const status = this.getNodeParameter('status', itemIndex, ['active']) as string | string[];
	const updatedAtFrom = this.getNodeParameter('updatedAtFrom', itemIndex, '') as string;
	const category = this.getNodeParameter('category', itemIndex, 0) as number;

	// Параметры пагинации
	const enablePagination = this.getNodeParameter('enablePagination', itemIndex, false) as boolean;

	let paginationType: 'all' | 'limit' = 'all';
	let maxPages = 1000; //
	let enableDelay = false;
	let requestDelay = 0;

	if (enablePagination) {
		paginationType = this.getNodeParameter('paginationType', itemIndex, 'all') as 'all' | 'limit';
		enableDelay = this.getNodeParameter('enableDelay', itemIndex, false) as boolean;

		if (enableDelay) {
			requestDelay = this.getNodeParameter('requestDelay', itemIndex, 10) as number;
		}

		if (paginationType === 'limit') {
			maxPages = this.getNodeParameter('maxPages', itemIndex, 10) as number;
		}
	}

	// === ВАЛИДАЦИЯ ПАРАМЕТРОВ ===

	validateAvitoApiParams.call(this, this, itemIndex, { perPage, page: startPage });

	// Формируем базовые параметры запроса
	const baseParams: PaginatedQueryParams = {
		per_page: perPage,
		page: startPage,
	};

	const normalizedStatus = Array.isArray(status) ? status.join(',') : status;
	if (normalizedStatus) baseParams.status = normalizedStatus;
	if (updatedAtFrom) baseParams.updatedAtFrom = toYYYYMMDD(updatedAtFrom);
	if (category && category > 0) baseParams.category = category;

	// === ВЫПОЛНЕНИЕ ЗАПРОСА ===

	// Если пагинация отключена - выполняем простой запрос
	if (!enablePagination) {
		return await executeSinglePageRequest(this, baseParams, itemIndex, startTime);
	}

	// Если пагинация включена - выполняем расширенную логику
	return await executePaginatedRequest(
		this,
		maxPages,
		enableDelay,
		requestDelay,
		baseParams,
		itemIndex,
		startTime,
	);
}

async function executeSinglePageRequest(
	context: IExecuteFunctions,
	requestParams: PaginatedQueryParams,
	itemIndex: number,
	startTime: number,
): Promise<IDataObject> {
	try {
		const response = (await avitoApiRequest.call(
			context,
			'GET',
			'/core/v1/items',
			undefined,
			requestParams,
			itemIndex,
		)) as ItemsResponse;

		if (!response || !response.resources || !Array.isArray(response.resources)) {
			throw new NodeOperationError(context.getNode(), 'Получен некорректный ответ от Avito API', {
				itemIndex,
			});
		}

		const executionTime = Date.now() - startTime;

		return {
			...(response as Record<string, unknown>),
			meta: {
				...((response.meta as Record<string, unknown>) || {}),
				pagination_enabled: false,
				start_page: requestParams.page,
				total_items: response.resources?.length ?? 0,
				execution_time_ms: executionTime,
			},
		};
	} catch (error: unknown) {
		throw new NodeOperationError(context.getNode(), 'Ошибка при получении объявлений', {
			itemIndex,
			description: `Не удалось получить данные со страницы ${requestParams.page}. ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
		});
	}
}

async function executePaginatedRequest(
	context: IExecuteFunctions,
	maxPages: number,
	enableDelay: boolean,
	requestDelay: number,
	baseParams: PaginatedQueryParams,
	itemIndex: number,
	startTime: number,
): Promise<IDataObject> {
	let currentPage = baseParams.page || 1;
	let pageCount = 0;
	const allItems: IDataObject[] = [];
	let reachedMaxPages = false;

	try {
		while (pageCount < maxPages) {
			// Применяем задержку если настроена (и это не первый запрос)
			if (enableDelay && pageCount > 0 && requestDelay > 0) {
				await sleep(requestDelay);
			}

			const response = await avitoApiRequest.call(
				context,
				'GET',
				'/core/v1/items',
				undefined,
				{
					...baseParams,
					page: currentPage,
				},
				itemIndex,
			);

			if (!response || !response.resources || !Array.isArray(response.resources)) {
				break;
			}

			allItems.push(...(response.resources as IDataObject[]));
			pageCount++;

			// Проверяем условия остановки
			const receivedCount = response.resources.length;
			const isLastPage = receivedCount < (baseParams.per_page ?? 25);

			if (isLastPage) {
				break;
			}

			if (pageCount >= maxPages) {
				reachedMaxPages = true;
				break;
			}

			currentPage++;
		}

		const executionTime = Date.now() - startTime;

		return {
			resources: allItems,
			meta: {
				pagination_enabled: true,
				pages_processed: pageCount,
				total_items: allItems.length,
				start_page: baseParams.page,
				last_page: currentPage,
				execution_time_ms: executionTime,
				max_pages_reached: reachedMaxPages,
			},
		};
	} catch (error: unknown) {
		if (error instanceof NodeOperationError) {
			throw new NodeOperationError(context.getNode(), error.message, { itemIndex });
		}

		// Оборачиваем неожиданные ошибки
		throw new NodeOperationError(
			context.getNode(),
			'Критическая ошибка при выполнении пагинированного запроса',
			{
				itemIndex,
				description: `${error instanceof Error ? error.message : 'Неизвестная ошибка'}. Получено ${allItems.length} объявлений до ошибки.`,
			},
		);
	}
}
