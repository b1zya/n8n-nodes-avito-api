import type { IExecuteFunctions } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';
import { parsePositiveIntegerList } from './SpecialOffersUtils';

/**
 * Создание рассылки по нескольким объявлениям.
 * API: POST /special-offers/v1/multiCreate
 * Scope: special_offers:sending
 */
export async function openApiMultiCreate(this: IExecuteFunctions, itemIndex: number) {
	const itemIds = parsePositiveIntegerList(
		this,
		itemIndex,
		this.getNodeParameter('specialOffersItemIds', itemIndex) as string,
		'ID Объявлений',
	);

	return await avitoApiRequest.call(
		this,
		'POST',
		'/special-offers/v1/multiCreate',
		{ itemIds },
		undefined,
		itemIndex,
	);
}
