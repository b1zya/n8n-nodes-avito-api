import type { IExecuteFunctions } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';
import { parsePositiveIntegerList } from './SpecialOffersUtils';

/**
 * Проверка доступности рассылки по объявлениям.
 * API: POST /special-offers/v1/available
 * Scope: special_offers:sending
 */
export async function openApiAvailable(this: IExecuteFunctions, itemIndex: number) {
	const itemIds = parsePositiveIntegerList(
		this,
		itemIndex,
		this.getNodeParameter('specialOffersItemIds', itemIndex) as string,
		'ID Объявлений',
	);

	return await avitoApiRequest.call(
		this,
		'POST',
		'/special-offers/v1/available',
		{ itemIds },
		undefined,
		itemIndex,
	);
}
