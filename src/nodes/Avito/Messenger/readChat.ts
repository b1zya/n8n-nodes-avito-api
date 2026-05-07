import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { messengerApiRequest, validatePositiveInteger, validateRequiredString } from './MessengerUtils';

export async function readChat(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const userId = this.getNodeParameter('messengerUserId', itemIndex) as number;
	const chatId = this.getNodeParameter('messengerChatId', itemIndex) as string;

	validatePositiveInteger(this, itemIndex, 'userId', userId);
	const normalizedChatId = encodeURIComponent(validateRequiredString(this, itemIndex, 'chatId', chatId));

	return await messengerApiRequest<IDataObject>(
		this,
		'POST',
		`/messenger/v1/accounts/${userId}/chats/${normalizedChatId}/read`,
		undefined,
		itemIndex,
	);
}
