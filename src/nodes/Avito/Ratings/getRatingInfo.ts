import type { IExecuteFunctions } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';

/**
 * Получение информации о рейтинге пользователя
 * API: GET /ratings/v1/info
 * Scope: ratings:read
 */
export async function getRatingInfo(this: IExecuteFunctions, itemIndex: number) {
	// Эта операция не требует дополнительных параметров
	// Просто выполняем запрос к API рейтингов
	
	return await avitoApiRequest.call(
		this,
		'GET',
		'/ratings/v1/info',
		undefined,
		undefined,
		itemIndex,
	);
}