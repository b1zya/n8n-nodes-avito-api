import type { IExecuteFunctions } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';

/**
 * Получение информации по тарифу в категории Транспорт.
 * API: GET /tariff/info/1
 * Auth: ClientCredentials
 */
export async function getTariffInfo(this: IExecuteFunctions, itemIndex: number) {
	return await avitoApiRequest.call(this, 'GET', '/tariff/info/1', undefined, undefined, itemIndex);
}
