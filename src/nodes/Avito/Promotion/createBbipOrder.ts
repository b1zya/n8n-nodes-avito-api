import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { getBbipItems, getPromotionAhEmployeeId, promotionApiRequest } from './PromotionUtils';

export async function createBbipOrder(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	return await promotionApiRequest(
		this,
		'PUT',
		'/promotion/v1/items/services/bbip/orders/create',
		{ items: getBbipItems(this, itemIndex) },
		itemIndex,
		getPromotionAhEmployeeId(this, itemIndex),
	);
}
