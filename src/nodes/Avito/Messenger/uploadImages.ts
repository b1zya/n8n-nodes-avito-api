import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { messengerUploadImageRequest, validatePositiveInteger, validateRequiredString } from './MessengerUtils';

export async function uploadImages(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const userId = this.getNodeParameter('messengerUserId', itemIndex) as number;
	const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex) as string;

	validatePositiveInteger(this, itemIndex, 'userId', userId);

	return await messengerUploadImageRequest.call(
		this,
		userId,
		validateRequiredString(this, itemIndex, 'binaryPropertyName', binaryPropertyName),
		itemIndex,
	);
}
