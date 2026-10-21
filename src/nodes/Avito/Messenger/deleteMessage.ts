import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	messengerApiRequest,
	validatePositiveInteger,
	validateRequiredString,
} from './MessengerUtils';

export async function deleteMessage(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const userId = this.getNodeParameter('messengerUserId', itemIndex) as number;
	const chatId = this.getNodeParameter('messengerChatId', itemIndex) as string;
	const messageId = this.getNodeParameter('messengerMessageId', itemIndex) as string;

	validatePositiveInteger(this, itemIndex, 'userId', userId);
	const normalizedChatId = encodeURIComponent(
		validateRequiredString(this, itemIndex, 'chatId', chatId),
	);
	const normalizedMessageId = encodeURIComponent(
		validateRequiredString(this, itemIndex, 'messageId', messageId),
	);

	return await messengerApiRequest<IDataObject>(
		this,
		'POST',
		`/messenger/v1/accounts/${userId}/chats/${normalizedChatId}/messages/${normalizedMessageId}`,
		undefined,
		itemIndex,
	);
}
