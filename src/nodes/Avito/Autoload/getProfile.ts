import type { IExecuteFunctions } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';

/**
 * Получение настроек профиля пользователя автозагрузки
 * API: GET /autoload/v2/profile
 * Scope: autoload:reports
 */
export async function getProfile(this: IExecuteFunctions, itemIndex: number) {
	return await avitoApiRequest.call(
		this,
		'GET',
		'/autoload/v2/profile',
		undefined,
		undefined,
		itemIndex,
	);
}