import type { IExecuteFunctions } from 'n8n-workflow';

import { avitoApiRequest, validateRequiredFields } from '../GenericFunctions';

export async function remove(this: IExecuteFunctions, itemIndex: number) {
	const itemId = this.getNodeParameter('itemId', itemIndex) as number;

	validateRequiredFields.call(this, this, itemIndex, { itemId });

	return await avitoApiRequest.call(
		this,
		'POST',
		'/cpxpromo/1/remove',
		{
			itemID: itemId,
		},
		undefined,
		itemIndex,
	);
}