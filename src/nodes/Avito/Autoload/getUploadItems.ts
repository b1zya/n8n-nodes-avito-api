import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import {
	UPLOAD_ITEMS_MAX_PER_PAGE,
	fetchUploadPages,
	getUploadPaginationOptions,
	resolveUploadEndpoint,
	validateUploadPaging,
} from './AutoloadUtils';

interface UploadItemsFilters {
	query?: string;
	sections?: string;
}

/**
 * Объявления одной загрузки автозагрузки.
 * API: GET /autoload/v4/uploads/current/items | GET /autoload/v4/uploads/last_successful/items
 * Scope: autoload:reports
 * Замена устаревшего GET /autoload/v2/reports/{report_id}/items.
 * Отличия v4: выборки по произвольному report_id больше нет, доступны только
 * текущая и последняя успешно завершённая загрузка; в ответе пропало поле applied_vas -
 * применённые услуги продвижения смотрите через getItemInfo.
 * Заменяет также getAutoloadItemsInfoV2 (поиск по ID из файла) через фильтр query.
 */
export async function getUploadItems(this: IExecuteFunctions, itemIndex: number) {
	const endpoint = resolveUploadEndpoint(this, itemIndex, '/items');

	const page = this.getNodeParameter('uploadItemsPage', itemIndex, 1) as number;
	const perPage = this.getNodeParameter(
		'uploadItemsPerPage',
		itemIndex,
		UPLOAD_ITEMS_MAX_PER_PAGE,
	) as number;
	const filters = this.getNodeParameter('uploadItemsFilters', itemIndex, {}) as UploadItemsFilters;

	// У этой ручки свой потолок: 100, а не 50 как у истории загрузок.
	validateUploadPaging(this, itemIndex, page, perPage, UPLOAD_ITEMS_MAX_PER_PAGE);

	const qs: IDataObject = { page, perPage };
	if (filters.query?.trim()) qs.query = filters.query.trim();
	if (filters.sections?.trim()) qs.sections = filters.sections.trim();

	return await fetchUploadPages(
		this,
		endpoint,
		qs,
		'items',
		itemIndex,
		getUploadPaginationOptions(this, itemIndex, 'uploadItems'),
	);
}
