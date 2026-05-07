import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	callTrackingApiRequest,
	validateDateTimeRange,
	validateDateTime,
	validateNonNegativeInteger,
	validatePositiveInteger,
} from './CallTrackingUtils';

/**
 * Получение списка звонков с фильтром по времени звонка.
 * API: POST /calltracking/v1/getCalls/
 * Лимит: 5 запросов/мин.
 */
export async function getCalls(this: IExecuteFunctions, itemIndex: number) {
	const dateTimeFrom = validateDateTime(
		this,
		itemIndex,
		'dateTimeFrom',
		this.getNodeParameter('callTrackingDateTimeFrom', itemIndex) as string,
	);
	const dateTimeTo = this.getNodeParameter('callTrackingDateTimeTo', itemIndex, '') as string;
	const limit = this.getNodeParameter('callTrackingLimit', itemIndex) as number;
	const offset = this.getNodeParameter('callTrackingOffset', itemIndex) as number;

	validatePositiveInteger(this, itemIndex, 'limit', limit, 100);
	validateNonNegativeInteger(this, itemIndex, 'offset', offset);

	const body: IDataObject = {
		dateTimeFrom,
		limit,
		offset,
	};

	if (dateTimeTo) {
		const normalizedDateTimeTo = validateDateTime(this, itemIndex, 'dateTimeTo', dateTimeTo);
		validateDateTimeRange(this, itemIndex, dateTimeFrom, normalizedDateTimeTo);
		body.dateTimeTo = normalizedDateTimeTo;
	}

	return await callTrackingApiRequest.call(this, 'POST', '/calltracking/v1/getCalls/', body, itemIndex);
}
