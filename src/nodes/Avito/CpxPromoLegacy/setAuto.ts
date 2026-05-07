import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

// ИСПРАВЛЕНО: Импорт стандартных функций n8n вместо кастомного AvitoApiAuth
import { avitoApiRequest, validateRequiredFields } from '../GenericFunctions';

export async function setAuto(this: IExecuteFunctions, itemIndex: number) {
	const itemId = this.getNodeParameter('itemId', itemIndex) as number;
	const budgetPenny = this.getNodeParameter('budgetPenny', itemIndex) as number;
	const budgetType = this.getNodeParameter('budgetType', itemIndex) as string;
	const actionTypeId = this.getNodeParameter('actionTypeId', itemIndex) as number;

	// ИСПРАВЛЕНО: Валидация через стандартные функции
	validateRequiredFields.call(this, this, itemIndex, { itemId, budgetPenny, budgetType, actionTypeId });

	// ПРОВЕРКА: Дополнительная валидация бюджета
	if (budgetPenny <= 0) {
		throw new NodeOperationError(this.getNode(), 'Бюджет должен быть больше 0', { itemIndex });
	}

	// ОСТАВЛЕНО: Кастомная валидация типа бюджета (специфична для Avito API)
	const validBudgetTypes = ['1d', '7d', '30d'];
	if (!validBudgetTypes.includes(budgetType)) {
		throw new NodeOperationError(
			this.getNode(),
			`Некорректный тип бюджета. Допустимые значения: ${validBudgetTypes.join(', ')}`,
			{ itemIndex },
		);
	}

	const requestBody = {
		itemID: itemId,
		budgetPenny,
		budgetType,
		actionTypeID: actionTypeId,
	};

	// ИСПРАВЛЕНО: Стандартный вызов API вместо кастомной логики
	return await avitoApiRequest.call(
		this,
		'POST',
		'/cpxpromo/1/setAuto',
		requestBody,
		undefined,
		itemIndex,
	);
}