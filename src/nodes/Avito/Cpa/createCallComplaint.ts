import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { cpaApiRequest, validatePositiveInteger, validateRequiredString } from './CpaUtils';

/**
 * Создание жалобы на CPA-звонок.
 * API: POST /cpa/v1/createComplaint
 * Лимит: 1 запрос/мин.
 */
export async function createCallComplaint(this: IExecuteFunctions, itemIndex: number) {
	const callId = this.getNodeParameter('callId', itemIndex) as number;
	const message = validateRequiredString(
		this,
		itemIndex,
		'complaintMessage',
		this.getNodeParameter('complaintMessage', itemIndex) as string,
	);

	validatePositiveInteger(this, itemIndex, 'callId', callId);

	const body: IDataObject = {
		callId,
		message,
	};

	return await cpaApiRequest.call(this, 'POST', '/cpa/v1/createComplaint', body, itemIndex);
}
