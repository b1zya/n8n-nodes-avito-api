import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	getPromotionAhEmployeeId,
	promotionApiRequest,
	validatePromotionItemIds,
} from './PromotionUtils';

export async function getServicesByItems(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const itemIdsParam = this.getNodeParameter('promotionItemIds', itemIndex) as string;

	return await promotionApiRequest(
		this,
		'POST',
		'/promotion/v2/items/services/get',
		{ itemIds: validatePromotionItemIds(this, itemIndex, itemIdsParam) },
		itemIndex,
		getPromotionAhEmployeeId(this, itemIndex),
	);
}
