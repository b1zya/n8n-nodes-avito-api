import type { IExecuteFunctions } from 'n8n-workflow';
import { cpaApiRequest, validatePositiveInteger } from './CpaUtils';

/**
 * Получение CPA-чата по actionId.
 * API: GET /cpa/v1/chatByActionId/{actionId}
 * Лимит: 3 запроса/мин.
 */
export async function getChatByActionId(this: IExecuteFunctions, itemIndex: number) {
	const actionId = this.getNodeParameter('actionId', itemIndex) as number;
	validatePositiveInteger(this, itemIndex, 'actionId', actionId);

	return await cpaApiRequest.call(
		this,
		'GET',
		`/cpa/v1/chatByActionId/${actionId}`,
		undefined,
		itemIndex,
	);
}
