import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { getBbipItems, getPromotionAhEmployeeId, promotionApiRequest } from './PromotionUtils';

export async function getBbipForecasts(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	return await promotionApiRequest(
		this,
		'POST',
		'/promotion/v1/items/services/bbip/forecasts/get',
		{ items: getBbipItems(this, itemIndex) },
		itemIndex,
		getPromotionAhEmployeeId(this, itemIndex),
	);
}
