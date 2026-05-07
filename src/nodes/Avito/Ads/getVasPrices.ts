import type { IExecuteFunctions } from 'n8n-workflow';

import { 
	avitoApiRequest, 
	validateRequiredFields, 
	validateItemIds 
} from '../GenericFunctions';

export async function getVasPrices(this: IExecuteFunctions, itemIndex: number) {
	const userId = this.getNodeParameter('userId', itemIndex) as number;
	const itemIdsParam = this.getNodeParameter('itemIds', itemIndex) as string;

	validateRequiredFields.call(this, this, itemIndex, { userId });
	
	const itemIds = validateItemIds.call(this, this, itemIndex, itemIdsParam);

	return await avitoApiRequest.call(
		this,
		'POST',
		`/core/v1/accounts/${userId}/vas/prices`,
		{ itemIds },
		undefined,
		itemIndex,
	);
}