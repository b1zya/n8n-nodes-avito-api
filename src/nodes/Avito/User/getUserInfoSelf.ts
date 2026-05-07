import type { IExecuteFunctions } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';

/**
 * Получение информации об авторизованном пользователе.
 * API: GET /core/v1/accounts/self
 * Scope: user:read
 */
export async function getUserInfoSelf(this: IExecuteFunctions, itemIndex: number) {
	return await avitoApiRequest.call(
		this,
		'GET',
		'/core/v1/accounts/self',
		undefined,
		undefined,
		itemIndex,
	);
}
