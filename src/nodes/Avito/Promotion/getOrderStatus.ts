import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { getPromotionAhEmployeeId, promotionApiRequest, validateUuid } from './PromotionUtils';

export async function getOrderStatus(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const orderId = this.getNodeParameter('promotionOrderId', itemIndex) as string;

	return await promotionApiRequest(
		this,
		'POST',
		'/promotion/v1/items/services/orders/status',
		{ orderId: validateUuid(this, itemIndex, 'orderId', orderId) },
		itemIndex,
		getPromotionAhEmployeeId(this, itemIndex),
	);
}
