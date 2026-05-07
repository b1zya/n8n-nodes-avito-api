import type { IExecuteFunctions } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';
import { toRfc3339Utc, validateDateTimeRange } from './SpecialOffersUtils';

/**
 * Статистика по отправленным рассылкам за период.
 * API: POST /special-offers/v1/stats
 * Scope: special_offers:sending
 */
export async function openApiStats(this: IExecuteFunctions, itemIndex: number) {
	const dateTimeFrom = toRfc3339Utc(
		this,
		itemIndex,
		'Дата И Время От',
		this.getNodeParameter('specialOffersDateTimeFrom', itemIndex) as string,
	);
	const dateTimeTo = toRfc3339Utc(
		this,
		itemIndex,
		'Дата И Время До',
		this.getNodeParameter('specialOffersDateTimeTo', itemIndex) as string,
	);

	validateDateTimeRange(this, itemIndex, dateTimeFrom, dateTimeTo);

	return await avitoApiRequest.call(
		this,
		'POST',
		'/special-offers/v1/stats',
		{ dateTimeFrom, dateTimeTo },
		undefined,
		itemIndex,
	);
}
