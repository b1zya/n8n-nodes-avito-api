import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	messengerApiRequest,
	parseCommaSeparatedStringList,
	validatePositiveInteger,
} from './MessengerUtils';

export async function getVoiceFiles(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const userId = this.getNodeParameter('messengerUserId', itemIndex) as number;
	const voiceIds = this.getNodeParameter('messengerVoiceIds', itemIndex) as string;

	validatePositiveInteger(this, itemIndex, 'userId', userId);

	return await messengerApiRequest<IDataObject>(
		this,
		'GET',
		`/messenger/v1/accounts/${userId}/getVoiceFiles`,
		undefined,
		itemIndex,
		{ voice_ids: parseCommaSeparatedStringList(this, itemIndex, 'voiceIds', voiceIds) },
	);
}
