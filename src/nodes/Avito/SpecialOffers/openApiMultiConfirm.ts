import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';
import { getDispatches } from './SpecialOffersUtils';

/**
 * Подтверждение отправки рассылки и оплата.
 * API: POST /special-offers/v1/multiConfirm
 * Scope: special_offers:sending
 */
export async function openApiMultiConfirm(this: IExecuteFunctions, itemIndex: number) {
	const dispatches = getDispatches(this, itemIndex);
	const expiresAt = Number(this.getNodeParameter('specialOffersExpiresAt', itemIndex, 0));

	if (!Number.isInteger(expiresAt) || expiresAt < 0) {
		throw new NodeOperationError(this.getNode(), 'Дата окончания предложения должна быть Unix timestamp >= 0', {
			itemIndex,
		});
	}

	const body: IDataObject = { dispatches };
	if (expiresAt > 0) {
		body.expiresAt = expiresAt;
	}

	return await avitoApiRequest.call(
		this,
		'POST',
		'/special-offers/v1/multiConfirm',
		body,
		undefined,
		itemIndex,
	);
}
