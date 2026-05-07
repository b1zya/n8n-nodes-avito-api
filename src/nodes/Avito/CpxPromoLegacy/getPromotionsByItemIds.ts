import type { IExecuteFunctions } from 'n8n-workflow';

// ИСПРАВЛЕНО: Импорт стандартных функций n8n вместо кастомного AvitoApiAuth
import { avitoApiRequest, validateItemIds } from '../GenericFunctions';

export async function getPromotionsByItemIds(this: IExecuteFunctions, itemIndex: number) {
	const itemIdsParam = this.getNodeParameter('itemIds', itemIndex) as string;

	// ИСПРАВЛЕНО: Использование стандартной валидации ID с автоматической проверкой лимита 200
	const itemIds = validateItemIds.call(this, this, itemIndex, itemIdsParam, 200);

	// ИСПРАВЛЕНО: Стандартный вызов API вместо кастомной логики
	return await avitoApiRequest.call(
		this,
		'POST',
		'/cpxpromo/1/getPromotionsByItemIds',
		{
			itemIDs: itemIds,
		},
		undefined,
		itemIndex,
	);
}