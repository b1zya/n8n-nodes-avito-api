import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	cpaApiRequest,
	validateDateTime,
	validateNonNegativeInteger,
	validatePositiveInteger,
} from './CpaUtils';

/**
 * Получение списка CPA-звонков по времени создания.
 * API: POST /cpa/v2/callsByTime
 * Лимит: 1 запрос/мин.
 */
export async function getCallsByTime(this: IExecuteFunctions, itemIndex: number) {
	const dateTimeFrom = validateDateTime(
		this,
		itemIndex,
		'dateTimeFrom',
		this.getNodeParameter('dateTimeFrom', itemIndex) as string,
	);
	const limit = this.getNodeParameter('limit', itemIndex) as number;
	const offset = this.getNodeParameter('offset', itemIndex) as number;

	validatePositiveInteger(this, itemIndex, 'limit', limit);
	validateNonNegativeInteger(this, itemIndex, 'offset', offset);

	const body: IDataObject = {
		dateTimeFrom,
		limit,
		offset,
	};

	return await cpaApiRequest.call(this, 'POST', '/cpa/v2/callsByTime', body, itemIndex);
}
