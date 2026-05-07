import type { IExecuteFunctions } from 'n8n-workflow';
import { cpaApiRequest } from './CpaUtils';

/**
 * Получение текущего CPA-баланса.
 * API: POST /cpa/v3/balanceInfo
 * Лимит: 50 запросов/мин.
 */
export async function getBalance(this: IExecuteFunctions, itemIndex: number) {
	return await cpaApiRequest.call(this, 'POST', '/cpa/v3/balanceInfo', '{}', itemIndex);
}
