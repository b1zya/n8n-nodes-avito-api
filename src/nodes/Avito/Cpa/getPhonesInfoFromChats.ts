import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { cpaApiRequest, validateDateTime, validateNonNegativeInteger, validatePositiveInteger } from './CpaUtils';

/**
 * Получение информации по номерам телефонов из целевых чатов.
 * API: POST /cpa/v1/phonesInfoFromChats
 * Лимит: 5 запросов/мин.
 */
export async function getPhonesInfoFromChats(this: IExecuteFunctions, itemIndex: number) {
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

	return await cpaApiRequest.call(this, 'POST', '/cpa/v1/phonesInfoFromChats', body, itemIndex);
}
