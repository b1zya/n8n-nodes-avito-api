import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';
import { getAccountHierarchyHeaders } from './AccountHierarchyUtils';

/**
 * Список сотрудников иерархии аккаунтов.
 * API: GET /getEmployeesV1
 * Scope: ah:access
 * Требуется оплаченный тариф в личном кабинете Avito.
 * Ответ по спецификации - массив объектов, а не объект, поэтому нужен каст.
 */
export async function getEmployees(this: IExecuteFunctions, itemIndex: number) {
	const response = await avitoApiRequest.call(
		this,
		'GET',
		'/getEmployeesV1',
		undefined,
		undefined,
		itemIndex,
		getAccountHierarchyHeaders.call(this, itemIndex),
	);

	return response as unknown as IDataObject[];
}
