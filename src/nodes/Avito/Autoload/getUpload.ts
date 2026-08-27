import type { IExecuteFunctions } from 'n8n-workflow';
import { resolveUploadEndpoint, uploadsApiRequest } from './AutoloadUtils';

/**
 * Статистика по одной загрузке автозагрузки.
 * API: GET /autoload/v4/uploads/current | GET /autoload/v4/uploads/last_successful
 * Scope: autoload:reports
 * Замена устаревшего GET /autoload/v3/reports/last_completed_report.
 * Отличия v4: report_id -> upload_id, feeds_urls -> feed_urls, section_stats -> stats,
 * полей finished_at и listing_fees в ответе больше нет.
 */
export async function getUpload(this: IExecuteFunctions, itemIndex: number) {
	const endpoint = resolveUploadEndpoint(this, itemIndex);

	return await uploadsApiRequest(this, endpoint, undefined, itemIndex);
}
