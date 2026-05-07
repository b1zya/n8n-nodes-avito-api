import type { IExecuteFunctions } from 'n8n-workflow';

// ИСПРАВЛЕНО: Импорт стандартных функций n8n вместо кастомного AvitoApiAuth
import { avitoApiRequest, validateRequiredFields } from '../GenericFunctions';

export async function updatePrice(this: IExecuteFunctions, itemIndex: number) {
	const itemId = this.getNodeParameter('itemId', itemIndex) as number;
	const price = this.getNodeParameter('price', itemIndex) as number;

	// ИСПРАВЛЕНО: Валидация через стандартные функции
	validateRequiredFields.call(this, this, itemIndex, { itemId, price });

	// ИСПРАВЛЕНО: Стандартный вызов API вместо кастомной логики
	return await avitoApiRequest.call(
		this,
		'POST',
		`/core/v1/items/${itemId}/update_price`,
		{ price },
		undefined,
		itemIndex,
	);
}