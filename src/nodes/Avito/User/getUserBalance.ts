import type { IExecuteFunctions } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';
import { validateUserId } from './UserUtils';

/**
 * Получение баланса кошелька пользователя.
 * API: GET /core/v1/accounts/{user_id}/balance/
 * Scope: user_balance:read
 */
export async function getUserBalance(this: IExecuteFunctions, itemIndex: number) {
	const userId = this.getNodeParameter('userId', itemIndex) as number;
	validateUserId(this, itemIndex, userId);

	return await avitoApiRequest.call(
		this,
		'GET',
		`/core/v1/accounts/${userId}/balance/`,
		undefined,
		undefined,
		itemIndex,
	);
}
