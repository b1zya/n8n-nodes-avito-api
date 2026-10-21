import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { getPromotionAhEmployeeId, promotionApiRequest } from './PromotionUtils';

export async function getServicesDict(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject[]> {
	return await promotionApiRequest<IDataObject[]>(
		this,
		'POST',
		'/promotion/v1/items/services/dict',
		undefined,
		itemIndex,
		getPromotionAhEmployeeId(this, itemIndex),
	);
}
