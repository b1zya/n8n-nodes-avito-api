import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { callTrackingApiRequest, validatePositiveInteger } from './CallTrackingUtils';

/**
 * Получение информации о звонке по callId.
 * API: POST /calltracking/v1/getCallById/
 * Лимит: 5 запросов/мин.
 */
export async function getCallById(this: IExecuteFunctions, itemIndex: number) {
	const callId = this.getNodeParameter('callTrackingCallId', itemIndex) as number;
	validatePositiveInteger(this, itemIndex, 'callId', callId);

	const body: IDataObject = { callId };

	return await callTrackingApiRequest.call(
		this,
		'POST',
		'/calltracking/v1/getCallById/',
		body,
		itemIndex,
	);
}
