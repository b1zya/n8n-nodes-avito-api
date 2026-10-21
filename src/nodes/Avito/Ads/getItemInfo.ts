import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getErrorMessage } from '../types/AvitoTypes';

// ИСПРАВЛЕНО: Импорт стандартных функций n8n вместо кастомного AvitoApiAuth
import { avitoApiRequest, validateRequiredFields } from '../GenericFunctions';

export async function getItemInfo(this: IExecuteFunctions, itemIndex: number) {
	// ✅ ИСПРАВЛЕНО: Безопасное получение параметров с проверкой типов
	const itemId = this.getNodeParameter('itemId', itemIndex) as number;
	const userId = this.getNodeParameter('userId', itemIndex, undefined) as number | undefined;

	// ✅ ИСПРАВЛЕНО: Проверка типов параметров ПЕРЕД валидацией
	if (typeof itemId !== 'number' || isNaN(itemId) || itemId <= 0) {
		throw new NodeOperationError(this.getNode(), 'Item ID must be a valid positive number', {
			itemIndex,
		});
	}

	// ✅ ИСПРАВЛЕНО: Валидация через стандартные функции с дополнительными проверками
	try {
		validateRequiredFields.call(this, this, itemIndex, { itemId });
	} catch (error: unknown) {
		// Более информативная ошибка
		throw new NodeOperationError(
			this.getNode(),
			`Parameter validation failed: ${getErrorMessage(error)}`,
			{ itemIndex },
		);
	}

	// ✅ ИСПРАВЛЕНО: Дополнительная валидация userId если указан
	if (typeof userId !== 'number' || isNaN(userId) || userId <= 0) {
		throw new NodeOperationError(this.getNode(), 'User ID must be a valid positive number', {
			itemIndex,
		});
	}

	const endpoint = `/core/v1/accounts/${userId}/items/${itemId}/`;

	return await avitoApiRequest.call(this, 'GET', endpoint, undefined, undefined, itemIndex);
}
