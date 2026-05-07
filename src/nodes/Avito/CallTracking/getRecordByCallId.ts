import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { callTrackingBinaryRequest, validatePositiveInteger, validateRequiredString } from './CallTrackingUtils';

/**
 * Получение audio/mpeg записи звонка по callId.
 * API: GET /calltracking/v1/getRecordByCallId/
 * Лимит: 50 запросов/мин. Read timeout по документации: 60s.
 */
export async function getRecordByCallId(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const callId = this.getNodeParameter('callTrackingCallId', itemIndex) as number;
	const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex, 'record') as string;
	const fileNameParameter = this.getNodeParameter('fileName', itemIndex, '') as string;

	validatePositiveInteger(this, itemIndex, 'callId', callId);
	const normalizedBinaryPropertyName = validateRequiredString(
		this,
		itemIndex,
		'binaryPropertyName',
		binaryPropertyName,
	);

	const fileName = fileNameParameter.trim() || `call-${callId}.mp3`;
	const recordBuffer = await callTrackingBinaryRequest.call(
		this,
		'/calltracking/v1/getRecordByCallId/',
		{ callId },
		itemIndex,
	);

	const binaryData = await this.helpers.prepareBinaryData(recordBuffer, fileName, 'audio/mpeg');

	return {
		json: {
			callId,
			fileName,
			mimeType: 'audio/mpeg',
			size: recordBuffer.length,
		},
		binary: {
			[normalizedBinaryPropertyName]: binaryData,
		},
	};
}
