import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { cpaApiRequest, validateDateTime, validateNonNegativeInteger, validatePositiveInteger } from './CpaUtils';

/**
 * Получение списка CPA-чатов по времени создания.
 * API: POST /cpa/v2/chatsByTime
 * Лимит: 40 запросов/мин.
 */
export async function getChatsByTime(this: IExecuteFunctions, itemIndex: number) {
	const dateTimeFrom = validateDateTime(
		this,
		itemIndex,
		'dateTimeFrom',
		this.getNodeParameter('dateTimeFrom', itemIndex) as string,
	);
	const limit = this.getNodeParameter('chatLimit', itemIndex) as number;
	const offset = this.getNodeParameter('offset', itemIndex) as number;

	validatePositiveInteger(this, itemIndex, 'limit', limit, 100);
	validateNonNegativeInteger(this, itemIndex, 'offset', offset);

	const body: IDataObject = {
		dateTimeFrom,
		limit,
		offset,
	};

	return await cpaApiRequest.call(this, 'POST', '/cpa/v2/chatsByTime', body, itemIndex);
}
