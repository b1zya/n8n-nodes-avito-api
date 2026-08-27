import type { IDataObject, IExecuteFunctions, JsonObject } from 'n8n-workflow';
import { NodeApiError, NodeOperationError, sleep } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';

/** По спецификации v4 perPage ограничен 50 (в устаревших v2/v3 было 200). */
export const UPLOADS_MAX_PER_PAGE = 50;

/** Жёсткий предел на число страниц, чтобы режим "собрать все" не ушёл в бесконечный цикл. */
const HARD_PAGE_LIMIT = 1000;

const UPLOAD_ENDPOINTS: Record<string, string> = {
	current: '/autoload/v4/uploads/current',
	lastSuccessful: '/autoload/v4/uploads/last_successful',
};

/**
 * Выбор ручки по значению поля uploadTarget.
 * Avito разделил "текущую" и "последнюю успешно завершённую" загрузку:
 * current даёт самые свежие данные, но они меняются в процессе загрузки,
 * last_successful — стабильные данные полностью обработанного фида.
 */
export function resolveUploadEndpoint(
	context: IExecuteFunctions,
	itemIndex: number,
	suffix: '' | '/items' = '',
): string {
	const target = context.getNodeParameter('uploadTarget', itemIndex, 'lastSuccessful') as string;
	const endpoint = UPLOAD_ENDPOINTS[target];

	if (!endpoint) {
		throw new NodeOperationError(context.getNode(), `Unknown upload target: ${target}`, {
			itemIndex,
		});
	}

	return endpoint + suffix;
}

/**
 * Запрос к /autoload/v4/uploads/* с осмысленной обработкой 404.
 * По спецификации 404 здесь означает не "неверный путь", а "подходящей загрузки нет",
 * поэтому общее сообщение из avitoApiRequest вводило бы в заблуждение.
 */
export async function uploadsApiRequest<T extends IDataObject = IDataObject>(
	context: IExecuteFunctions,
	endpoint: string,
	qs: IDataObject | undefined,
	itemIndex: number,
): Promise<T> {
	try {
		return (await avitoApiRequest.call(context, 'GET', endpoint, undefined, qs, itemIndex)) as T;
	} catch (error: unknown) {
		if (error instanceof NodeApiError && error.httpCode === '404') {
			throw new NodeApiError(context.getNode(), error as unknown as JsonObject, {
				itemIndex,
				message: 'Подходящей загрузки не найдено',
				description:
					'Avito отвечает 404, если загрузок ещё не было. Для "текущей" нужна загрузка, обработавшая хотя бы одно объявление, для "последней успешной" — полностью завершённая обработка фида.',
			});
		}

		// Повторная обёртка сохраняет message, httpCode и description исходной ошибки.
		throw new NodeApiError(context.getNode(), error as JsonObject, { itemIndex });
	}
}

export interface UploadPaginationOptions {
	enabled: boolean;
	collectAll: boolean;
	maxPages: number;
	delayMs: number;
}

/**
 * Считывает настройки пагинации из полей с общим префиксом.
 * Префикс нужен, потому что операции v4 живут в одной ноде с устаревшими v2/v3.
 */
export function getUploadPaginationOptions(
	context: IExecuteFunctions,
	itemIndex: number,
	prefix: string,
): UploadPaginationOptions {
	return {
		enabled: context.getNodeParameter(`${prefix}EnablePagination`, itemIndex, false) as boolean,
		collectAll:
			(context.getNodeParameter(`${prefix}PaginationType`, itemIndex, 'all') as string) === 'all',
		maxPages: context.getNodeParameter(`${prefix}MaxPages`, itemIndex, 10) as number,
		delayMs: context.getNodeParameter(`${prefix}RequestDelay`, itemIndex, 0) as number,
	};
}

export function validateUploadPaging(
	context: IExecuteFunctions,
	itemIndex: number,
	page: number,
	perPage: number,
): void {
	// В v4 нумерация страниц начинается с 1, а не с 0 как в устаревших v2/v3.
	if (!Number.isInteger(page) || page < 1) {
		throw new NodeOperationError(context.getNode(), 'Номер страницы должен быть больше или равен 1', {
			itemIndex,
			description: 'В Autoload API v4 страницы нумеруются с 1 (в устаревших v2/v3 — с 0).',
		});
	}

	if (!Number.isInteger(perPage) || perPage < 1 || perPage > UPLOADS_MAX_PER_PAGE) {
		throw new NodeOperationError(
			context.getNode(),
			`Количество на странице должно быть от 1 до ${UPLOADS_MAX_PER_PAGE}`,
			{
				itemIndex,
				description: `В Autoload API v4 максимум ${UPLOADS_MAX_PER_PAGE} записей на странице (в устаревших v2/v3 было 200).`,
			},
		);
	}
}

/**
 * Один запрос или обход всех страниц с накоплением списка listKey.
 * Останов: ответ без массива, недобор до perPage, признак meta.pages или лимит страниц.
 * Ошибки наверх отдаёт uploadsApiRequest, они уже привязаны к ноде и элементу.
 */
export async function fetchUploadPages(
	context: IExecuteFunctions,
	endpoint: string,
	baseQs: IDataObject,
	listKey: 'uploads' | 'items',
	itemIndex: number,
	pagination: UploadPaginationOptions,
): Promise<IDataObject> {
	const startTime = Date.now();
	const startPage = (baseQs.page as number) ?? 1;
	const perPage = (baseQs.perPage as number) ?? UPLOADS_MAX_PER_PAGE;

	if (!pagination.enabled) {
		const response = await uploadsApiRequest(context, endpoint, baseQs, itemIndex);

		return {
			...response,
			meta: {
				...((response.meta as IDataObject) ?? {}),
				pagination_enabled: false,
				single_request: true,
				execution_time_ms: Date.now() - startTime,
			},
		};
	}

	const effectiveMaxPages = pagination.collectAll
		? HARD_PAGE_LIMIT
		: Math.min(Math.max(pagination.maxPages, 1), HARD_PAGE_LIMIT);

	const collected: IDataObject[] = [];
	let currentPage = startPage;
	let pagesProcessed = 0;
	let totalAvailable: number | null = null;
	let totalPages: number | null = null;

	while (pagesProcessed < effectiveMaxPages) {
		if (pagination.delayMs > 0 && pagesProcessed > 0) {
			await sleep(pagination.delayMs);
		}

		const response = await uploadsApiRequest(
			context,
			endpoint,
			{ ...baseQs, page: currentPage },
			itemIndex,
		);
		const list = response[listKey];

		if (!Array.isArray(list)) {
			break;
		}

		if (pagesProcessed === 0) {
			const meta = response.meta as IDataObject | undefined;
			totalAvailable = (meta?.total as number) ?? null;
			totalPages = (meta?.pages as number) ?? null;
		}

		collected.push(...(list as IDataObject[]));
		pagesProcessed++;

		if (list.length < perPage) break;
		if (totalPages !== null && currentPage >= totalPages) break;

		currentPage++;
	}

	return {
		[listKey]: collected,
		meta: {
			pagination_enabled: true,
			pagination_type: pagination.collectAll ? 'all' : 'limit',
			pages_processed: pagesProcessed,
			start_page: startPage,
			current_page: currentPage,
			per_page: perPage,
			total_fetched: collected.length,
			total_available: totalAvailable,
			total_pages: totalPages,
			max_pages_reached: pagesProcessed >= effectiveMaxPages,
			execution_time_ms: Date.now() - startTime,
		},
	};
}
