import type { IExecuteFunctions } from 'n8n-workflow';

import { avitoApiRequest, validateRequiredFields } from '../GenericFunctions';

export async function getBids(this: IExecuteFunctions, itemIndex: number) {
	const itemId = this.getNodeParameter('itemId', itemIndex) as number;

	// ✅ ИСПРАВЛЕНО: Валидация через стандартные функции
	validateRequiredFields.call(this, this, itemIndex, { itemId });

	// ✅ ИСПРАВЛЕНО: Стандартный запрос вместо кастомной логики
	return await avitoApiRequest.call(this, 'GET', `/cpxpromo/1/getBids/${itemId}`, undefined, undefined, itemIndex);
}