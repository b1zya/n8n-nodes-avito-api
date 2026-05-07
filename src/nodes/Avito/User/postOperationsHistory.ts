import type { IExecuteFunctions } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';
import { toRfc3339Utc, validateOperationsHistoryRange } from './UserUtils';

/**
 * Получение истории операций пользователя.
 * API: POST /core/v1/accounts/operations_history/
 * Scope: user_operations:read
 */
export async function postOperationsHistory(this: IExecuteFunctions, itemIndex: number) {
	const dateTimeFrom = toRfc3339Utc(
		this,
		itemIndex,
		'Дата И Время От',
		this.getNodeParameter('userOperationsDateTimeFrom', itemIndex) as string,
	);
	const dateTimeTo = toRfc3339Utc(
		this,
		itemIndex,
		'Дата И Время До',
		this.getNodeParameter('userOperationsDateTimeTo', itemIndex) as string,
	);

	validateOperationsHistoryRange(this, itemIndex, dateTimeFrom, dateTimeTo);

	return await avitoApiRequest.call(
		this,
		'POST',
		'/core/v1/accounts/operations_history/',
		{ dateTimeFrom, dateTimeTo },
		undefined,
		itemIndex,
	);
}
