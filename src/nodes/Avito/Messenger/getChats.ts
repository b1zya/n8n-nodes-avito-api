import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	messengerApiRequest,
	parseCommaSeparatedIntegerList,
	validateNonNegativeInteger,
	validatePositiveInteger,
} from './MessengerUtils';

export async function getChats(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const userId = this.getNodeParameter('messengerUserId', itemIndex) as number;
	const itemIds = this.getNodeParameter('messengerItemIds', itemIndex, '') as string;
	const unreadOnly = this.getNodeParameter('messengerUnreadOnly', itemIndex, false) as boolean;
	const chatTypes = this.getNodeParameter('messengerChatTypes', itemIndex, ['u2i']) as string[];
	const limit = this.getNodeParameter('messengerLimit', itemIndex, 100) as number;
	const offset = this.getNodeParameter('messengerOffset', itemIndex, 0) as number;

	validatePositiveInteger(this, itemIndex, 'userId', userId);
	validatePositiveInteger(this, itemIndex, 'limit', limit, 100);
	validateNonNegativeInteger(this, itemIndex, 'offset', offset, 1000);

	const qs: IDataObject = {
		unread_only: unreadOnly,
		limit,
		offset,
	};

	if (chatTypes.length > 0) {
		qs.chat_types = chatTypes.join(',');
	}

	const normalizedItemIds = parseCommaSeparatedIntegerList(
		this,
		itemIndex,
		'itemIds',
		itemIds,
		false,
	);

	if (normalizedItemIds) {
		qs.item_ids = normalizedItemIds;
	}

	return await messengerApiRequest<IDataObject>(
		this,
		'GET',
		`/messenger/v2/accounts/${userId}/chats`,
		undefined,
		itemIndex,
		qs,
	);
}
