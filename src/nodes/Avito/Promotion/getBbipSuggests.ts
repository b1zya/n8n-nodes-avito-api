import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { getXIsEmployee, promotionApiRequest, validatePromotionItemIds } from './PromotionUtils';

export async function getBbipSuggests(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const itemIdsParam = this.getNodeParameter('promotionItemIds', itemIndex) as string;

	return await promotionApiRequest(
		this,
		'POST',
		'/promotion/v1/items/services/bbip/suggests/get',
		{ itemIds: validatePromotionItemIds(this, itemIndex, itemIdsParam) },
		itemIndex,
		getXIsEmployee(this, itemIndex),
	);
}
