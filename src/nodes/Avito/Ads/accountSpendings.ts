import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';
import { getErrorMessage } from '../types/AvitoTypes';
import type { DynamicRequestBody } from '../types/AvitoTypes';
import {
	addDaysUTC,
	daysDiffInclusiveUTC,
	isStrictYYYYMMDD,
	safeJsonParse,
	toYYYYMMDD,
} from '../utils/date_normalize';

/**
 * Получение статистики расходов профиля.
 * API: POST /stats/v2/accounts/{user_id}/spendings
 * Лимит: 1 запрос/мин.
 */
export async function accountSpendings(this: IExecuteFunctions, itemIndex: number) {
	const userId = this.getNodeParameter('userId', itemIndex) as number;
	const dateFromRaw = this.getNodeParameter('spendingsDateFrom', itemIndex) as string;
	const dateToRaw = this.getNodeParameter('spendingsDateTo', itemIndex) as string;
	const grouping = this.getNodeParameter('spendingsGrouping', itemIndex) as string;
	const spendingTypes = this.getNodeParameter('spendingTypes', itemIndex) as string[];
	const additionalFields = this.getNodeParameter('spendingsAdditionalFields', itemIndex, {}) as {
		filter?: string;
	};

	if (!userId || typeof userId !== 'number' || !Number.isFinite(userId) || userId <= 0) {
		throw new NodeOperationError(this.getNode(), 'Укажите корректный ID пользователя (> 0)', { itemIndex });
	}

	if (!dateFromRaw || !dateToRaw) {
		throw new NodeOperationError(this.getNode(), 'Укажите дату начала и окончания', { itemIndex });
	}

	if (!spendingTypes.length) {
		throw new NodeOperationError(this.getNode(), 'Выберите хотя бы один тип расходов', { itemIndex });
	}

	let dateFrom: string;
	let dateTo: string;
	try {
		dateFrom = toYYYYMMDD(dateFromRaw);
		dateTo = toYYYYMMDD(dateToRaw);
	} catch (e: unknown) {
		throw new NodeOperationError(this.getNode(), getErrorMessage(e), { itemIndex });
	}

	if (!isStrictYYYYMMDD(dateFrom) || !isStrictYYYYMMDD(dateTo)) {
		throw new NodeOperationError(this.getNode(), 'Дата должна быть в формате YYYY-MM-DD (без времени)', {
			itemIndex,
		});
	}

	if (dateFrom > dateTo) {
		throw new NodeOperationError(
			this.getNode(),
			`Дата начала (${dateFrom}) позже даты окончания (${dateTo}). Пожалуйста, выберите более раннюю дату начала.`,
			{ itemIndex },
		);
	}

	const span = daysDiffInclusiveUTC(dateFrom, dateTo);
	if (span > 270) {
		const recommendedFrom = addDaysUTC(dateTo, -269);
		const recommendedTo = addDaysUTC(dateFrom, 269);
		throw new NodeOperationError(
			this.getNode(),
			`Выбранный диапазон — ${span} дней, что больше максимально допустимых 270.
Рекомендация: при выбранной дате окончания ${dateTo} установите дату начала не ранее ${recommendedFrom}.
Либо при дате начала ${dateFrom} установите дату окончания не позднее ${recommendedTo}.`,
			{ itemIndex },
		);
	}

	const requestBody: DynamicRequestBody = {
		dateFrom,
		dateTo,
		grouping,
		spendingTypes,
	};

	if (additionalFields?.filter) {
		try {
			const filter = safeJsonParse<Record<string, unknown>>(
				additionalFields.filter,
				'Некорректный JSON в поле "Фильтр"',
				this.getNode(),
				itemIndex,
			);

			if (Object.keys(filter).length > 0) {
				requestBody.filter = filter;
			}
		} catch (e: unknown) {
			throw new NodeOperationError(this.getNode(), getErrorMessage(e), { itemIndex });
		}
	}

	return await avitoApiRequest.call(
		this,
		'POST',
		`/stats/v2/accounts/${userId}/spendings`,
		requestBody,
		undefined,
		itemIndex,
	);
}
