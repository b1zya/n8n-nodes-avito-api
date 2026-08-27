import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { avitoApiRequest, validateRequiredFields } from '../GenericFunctions';
import { getAccountHierarchyHeaders } from './AccountHierarchyUtils';

/**
 * Список объявлений сотрудника с фильтром по категории.
 * API: POST /listItemsByEmployeeIdV1
 * Scope: ah:access
 * Получение объявлений по компании недоступно, employeeId обязателен.
 * Ответ: items со списком ID объявлений и hasNext для продолжения пагинации.
 */
export async function listItemsByEmployee(this: IExecuteFunctions, itemIndex: number) {
	const employeeId = this.getNodeParameter('accountHierarchyEmployeeId', itemIndex) as number;
	const categoryId = this.getNodeParameter('accountHierarchyCategoryId', itemIndex) as number;
	const lastItemId = this.getNodeParameter('accountHierarchyLastItemId', itemIndex, 0) as number;

	validateRequiredFields(this, itemIndex, { employeeId, categoryId });

	const body: IDataObject = { employeeId, categoryId };

	// По спецификации lastItemId имеет минимум 1, поэтому 0 означает первую страницу.
	if (lastItemId >= 1) {
		body.lastItemId = lastItemId;
	}

	return await avitoApiRequest.call(
		this,
		'POST',
		'/listItemsByEmployeeIdV1',
		body,
		undefined,
		itemIndex,
		getAccountHierarchyHeaders.call(this, itemIndex),
	);
}
