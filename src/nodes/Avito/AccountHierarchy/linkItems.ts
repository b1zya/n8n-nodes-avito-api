import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { avitoApiRequest, validateItemIds, validateRequiredFields } from '../GenericFunctions';

const MAX_LINKED_ITEMS = 50;

/**
 * Прикрепление объявлений к сотруднику иерархии или перезакрепление между сотрудниками.
 * API: POST /linkItemsV1
 * Scope: ah:access
 * Требуется оплаченный тариф в личном кабинете Avito.
 * По спецификации itemIds содержит от 1 до 50 элементов, employeeId минимум 1.
 * Заголовок X-Employee-Of для этой ручки в спецификации не объявлен.
 */
export async function linkItems(this: IExecuteFunctions, itemIndex: number) {
	const employeeId = this.getNodeParameter('accountHierarchyEmployeeId', itemIndex) as number;
	const rawItemIds = this.getNodeParameter('accountHierarchyItemIds', itemIndex) as string;

	validateRequiredFields(this, itemIndex, { employeeId });
	const itemIds = validateItemIds(this, itemIndex, rawItemIds, MAX_LINKED_ITEMS);

	const body: IDataObject = { employeeId, itemIds };

	await avitoApiRequest.call(this, 'POST', '/linkItemsV1', body, undefined, itemIndex);

	// Avito отвечает 204 без тела, поэтому собираем результат сами:
	// иначе в workflow ушел бы пустой элемент без признака успеха.
	return { success: true, employeeId, itemIds, linkedCount: itemIds.length } as IDataObject;
}
