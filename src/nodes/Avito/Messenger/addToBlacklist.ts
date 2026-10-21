import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { messengerApiRequest, parseJsonArray, validatePositiveInteger } from './MessengerUtils';

export async function addToBlacklist(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const userId = this.getNodeParameter('messengerUserId', itemIndex) as number;
	const usersJson = this.getNodeParameter('messengerBlacklistUsers', itemIndex) as string;

	validatePositiveInteger(this, itemIndex, 'userId', userId);

	return await messengerApiRequest<IDataObject>(
		this,
		'POST',
		`/messenger/v2/accounts/${userId}/blacklist`,
		{ users: parseJsonArray(this, itemIndex, 'usersJson', usersJson) },
		itemIndex,
	);
}
