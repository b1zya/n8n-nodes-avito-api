import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';
import { getAccountHierarchyHeaders } from './AccountHierarchyUtils';

/**
 * Список телефонов компании с курсорной пагинацией.
 * API: GET /listCompanyPhonesV1
 * Scope: ah:access
 * Требуется оплаченный тариф в личном кабинете Avito.
 * Ответ: result.phones и result.cursor. Если cursor не вернулся, список закончился.
 */
export async function listCompanyPhones(this: IExecuteFunctions, itemIndex: number) {
	const cursor = this.getNodeParameter('accountHierarchyCursor', itemIndex, '') as string;
	const normalizedCursor = cursor.trim();

	const qs: IDataObject = {};
	if (normalizedCursor) {
		qs.cursor = normalizedCursor;
	}

	return await avitoApiRequest.call(
		this,
		'GET',
		'/listCompanyPhonesV1',
		undefined,
		qs,
		itemIndex,
		getAccountHierarchyHeaders.call(this, itemIndex),
	);
}
