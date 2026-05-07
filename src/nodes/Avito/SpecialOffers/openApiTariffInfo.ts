import type { IExecuteFunctions } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';

/**
 * Получение информации о тарифе рассылок.
 * API: POST /special-offers/v1/tariffInfo
 * Scope: special_offers:sending
 */
export async function openApiTariffInfo(this: IExecuteFunctions, itemIndex: number) {
	return await avitoApiRequest.call(
		this,
		'POST',
		'/special-offers/v1/tariffInfo',
		undefined,
		undefined,
		itemIndex,
	);
}
