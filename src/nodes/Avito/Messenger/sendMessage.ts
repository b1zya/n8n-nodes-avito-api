import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import {
	messengerApiRequest,
	validatePositiveInteger,
	validateRequiredString,
} from './MessengerUtils';

export async function sendMessage(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const userId = this.getNodeParameter('messengerUserId', itemIndex) as number;
	const chatId = this.getNodeParameter('messengerChatId', itemIndex) as string;
	const text = this.getNodeParameter('messengerText', itemIndex) as string;

	validatePositiveInteger(this, itemIndex, 'userId', userId);
	const normalizedChatId = encodeURIComponent(
		validateRequiredString(this, itemIndex, 'chatId', chatId),
	);
	const normalizedText = validateRequiredString(this, itemIndex, 'text', text);

	if (normalizedText.length > 1000) {
		throw new NodeOperationError(this.getNode(), 'text must be 1000 characters or fewer', {
			itemIndex,
		});
	}

	return await messengerApiRequest<IDataObject>(
		this,
		'POST',
		`/messenger/v1/accounts/${userId}/chats/${normalizedChatId}/messages`,
		{
			message: { text: normalizedText },
			type: 'text',
		},
		itemIndex,
	);
}
