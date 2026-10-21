import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { messengerApiRequest } from './MessengerUtils';

export async function getSubscriptions(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	return await messengerApiRequest<IDataObject>(
		this,
		'POST',
		'/messenger/v1/subscriptions',
		undefined,
		itemIndex,
	);
}
