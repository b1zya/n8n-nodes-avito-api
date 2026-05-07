import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { DynamicRequestBody } from '../types/AvitoTypes';

// ИСПРАВЛЕНО: Импорт стандартных функций n8n вместо кастомного AvitoApiAuth
import { avitoApiRequest } from '../GenericFunctions';

export async function setManual(this: IExecuteFunctions, itemIndex: number) {
	const itemId = this.getNodeParameter('itemId', itemIndex) as number;
	const bidPenny = this.getNodeParameter('bidPenny', itemIndex) as number;
	const actionTypeId = this.getNodeParameter('actionTypeId', itemIndex) as number;
	const limitPenny = this.getNodeParameter('limitPenny', itemIndex, undefined) as
		| number
		| undefined;

	// ОСТАВЛЕНО: Специфичная бизнес-валидация для этой операции
	if (!itemId) {
		throw new NodeOperationError(this.getNode(), 'Укажите ID объявления', { itemIndex });
	}

	if (!bidPenny || bidPenny <= 0) {
		throw new NodeOperationError(this.getNode(), 'Ставка должна быть больше 0', { itemIndex });
	}

	if (!actionTypeId) {
		throw new NodeOperationError(this.getNode(), 'Укажите тип события', { itemIndex });
	}

	const requestBody: DynamicRequestBody = {
		itemID: itemId,
		bidPenny,
		actionTypeID: actionTypeId,
	};

	if (limitPenny !== undefined && limitPenny > 0) {
		requestBody.limitPenny = limitPenny;
	}

	// ИСПРАВЛЕНО: Стандартный вызов API вместо кастомной логики
	return await avitoApiRequest.call(
		this,
		'POST',
		'/cpxpromo/1/setManual',
		requestBody as Record<string, unknown>,
		undefined,
		itemIndex,
	);
}