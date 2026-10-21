import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getErrorMessage } from '../types/AvitoTypes';

import { avitoApiRequest, validateRequiredFields, validateItemIds } from '../GenericFunctions';

import { toYYYYMMDD, isStrictYYYYMMDD } from '../utils/date_normalize';

export async function callsStats(this: IExecuteFunctions, itemIndex: number) {
	const userId = this.getNodeParameter('userId', itemIndex) as number;
	const itemIdsParam = this.getNodeParameter('itemIds', itemIndex) as string;

	// Получаем «сырые» даты из UI
	const dateFromRaw = this.getNodeParameter('dateFrom', itemIndex) as string;
	const dateToRaw = this.getNodeParameter('dateTo', itemIndex) as string;

	// Валидация обязательных полей
	validateRequiredFields.call(this, this, itemIndex, {
		userId,
		dateFrom: dateFromRaw,
		dateTo: dateToRaw,
	});

	// Нормализуем даты к YYYY-MM-DD
	let dateFrom = '';
	let dateTo = '';
	try {
		dateFrom = toYYYYMMDD(dateFromRaw);
		dateTo = toYYYYMMDD(dateToRaw);
	} catch (e: unknown) {
		throw new NodeOperationError(this.getNode(), getErrorMessage(e), { itemIndex });
	}

	// Строгая проверка формата YYYY-MM-DD (без времени)
	if (!isStrictYYYYMMDD(dateFrom) || !isStrictYYYYMMDD(dateTo)) {
		throw new NodeOperationError(
			this.getNode(),
			'Дата должна быть в формате YYYY-MM-DD (без времени)',
			{ itemIndex },
		);
	}

	// Проверка порядка дат
	if (dateFrom > dateTo) {
		throw new NodeOperationError(
			this.getNode(),
			`Дата начала (${dateFrom}) позже даты окончания (${dateTo}). Пожалуйста, выберите более раннюю дату начала.`,
			{ itemIndex },
		);
	}

	const body: Record<string, unknown> = {
		dateFrom,
		dateTo,
	};

	if (itemIdsParam?.trim()) {
		body.itemIds = validateItemIds.call(this, this, itemIndex, itemIdsParam);
	}

	return await avitoApiRequest.call(
		this,
		'POST',
		`/core/v1/accounts/${userId}/calls/stats/`,
		body,
		undefined,
		itemIndex,
	);
}
