import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { getPromotionAhEmployeeId, promotionApiRequest, validatePositiveInteger } from './PromotionUtils';

export async function listOrders(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const page = this.getNodeParameter('promotionOrdersPage', itemIndex, 1) as number;
	const perPage = this.getNodeParameter('promotionOrdersPerPage', itemIndex, 20) as number;

	validatePositiveInteger(this, itemIndex, 'page', page);
	validatePositiveInteger(this, itemIndex, 'perPage', perPage, 100);

	return await promotionApiRequest(
		this,
		'POST',
		'/promotion/v1/items/services/orders/get',
		{ pagination: { page, perPage } },
		itemIndex,
		getPromotionAhEmployeeId(this, itemIndex),
	);
}
