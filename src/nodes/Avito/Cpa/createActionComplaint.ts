import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { cpaApiRequest, validatePositiveInteger, validateRequiredString } from './CpaUtils';

/**
 * Создание жалобы на целевое действие по actionId.
 * API: POST /cpa/v1/createComplaintByActionId
 * Лимит: 3 запроса/мин.
 */
export async function createActionComplaint(this: IExecuteFunctions, itemIndex: number) {
	const actionId = this.getNodeParameter('actionId', itemIndex) as number;
	const message = validateRequiredString(
		this,
		itemIndex,
		'complaintMessage',
		this.getNodeParameter('complaintMessage', itemIndex) as string,
	);

	validatePositiveInteger(this, itemIndex, 'actionId', actionId);

	const body: IDataObject = {
		actionId,
		message,
	};

	return await cpaApiRequest.call(this, 'POST', '/cpa/v1/createComplaintByActionId', body, itemIndex);
}
