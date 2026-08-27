import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import {
	fetchUploadPages,
	getUploadPaginationOptions,
	validateUploadPaging,
} from './AutoloadUtils';

interface UploadsFilters {
	dateFrom?: string;
	dateTo?: string;
}

/**
 * История загрузок автозагрузки.
 * API: GET /autoload/v4/uploads
 * Scope: autoload:reports
 * Замена устаревших getReportsV2 (GET /autoload/v2/reports) и getReportByIdV2/V3:
 * статистика каждой загрузки приходит прямо в списке, отдельный запрос по ID не нужен.
 * Старые методы удаляют 08.03.2027, с 08.09.2026 они отдают неполные данные старше 7 дней.
 * Отличия v4: страницы с 1, perPage максимум 50, параметры в camelCase,
 * список приходит в поле uploads, идентификатор загрузки — upload_id.
 * Самая свежая загрузка идёт первой в списке.
 */
export async function getUploads(this: IExecuteFunctions, itemIndex: number) {
	const page = this.getNodeParameter('uploadsPage', itemIndex, 1) as number;
	const perPage = this.getNodeParameter('uploadsPerPage', itemIndex, 10) as number;
	const filters = this.getNodeParameter('uploadsFilters', itemIndex, {}) as UploadsFilters;

	validateUploadPaging(this, itemIndex, page, perPage);

	const qs: IDataObject = { page, perPage };
	if (filters.dateFrom) qs.dateFrom = filters.dateFrom;
	if (filters.dateTo) qs.dateTo = filters.dateTo;

	return await fetchUploadPages(
		this,
		'/autoload/v4/uploads',
		qs,
		'uploads',
		itemIndex,
		getUploadPaginationOptions(this, itemIndex, 'uploads'),
	);
}
