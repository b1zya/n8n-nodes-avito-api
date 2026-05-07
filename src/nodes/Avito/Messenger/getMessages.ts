import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	messengerApiRequest,
	validateNonNegativeInteger,
	validatePositiveInteger,
	validateRequiredString,
} from './MessengerUtils';

export async function getMessages(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject[]> {
	const userId = this.getNodeParameter('messengerUserId', itemIndex) as number;
	const chatId = this.getNodeParameter('messengerChatId', itemIndex) as string;
	const limit = this.getNodeParameter('messengerLimit', itemIndex, 100) as number;
	const offset = this.getNodeParameter('messengerOffset', itemIndex, 0) as number;

	validatePositiveInteger(this, itemIndex, 'userId', userId);
	validatePositiveInteger(this, itemIndex, 'limit', limit, 100);
	validateNonNegativeInteger(this, itemIndex, 'offset', offset, 1000);
	const normalizedChatId = encodeURIComponent(validateRequiredString(this, itemIndex, 'chatId', chatId));

	return await messengerApiRequest<IDataObject[]>(
		this,
		'GET',
		`/messenger/v3/accounts/${userId}/chats/${normalizedChatId}/messages/`,
		undefined,
		itemIndex,
		{ limit, offset },
	);
}
