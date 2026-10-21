import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { messengerApiRequest, validateUrl } from './MessengerUtils';

export async function subscribeWebhook(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const url = this.getNodeParameter('messengerWebhookUrl', itemIndex) as string;

	return await messengerApiRequest<IDataObject>(
		this,
		'POST',
		'/messenger/v3/webhook',
		{ url: validateUrl(this, itemIndex, 'webhookUrl', url) },
		itemIndex,
	);
}
