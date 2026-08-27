import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

/**
 * Заголовок X-Employee-Of для запросов от имени сотрудника компании.
 * По спецификации Avito его принимают только checkAhUserV2, getEmployeesV1,
 * listCompanyPhonesV1 и listItemsByEmployeeIdV1. Для getAhInfoV1 и linkItemsV1
 * заголовок в спецификации не объявлен и не отправляется.
 * Устаревший X-Is-Employee намеренно не используется.
 */
export function getAccountHierarchyHeaders(
	this: IExecuteFunctions,
	itemIndex: number,
): IDataObject | undefined {
	const companyId = this.getNodeParameter('accountHierarchyEmployeeOf', itemIndex, 0) as number;

	if (!companyId) {
		return undefined;
	}

	if (!Number.isInteger(companyId) || companyId < 1) {
		throw new NodeOperationError(this.getNode(), 'X-Employee-Of must be a positive integer', {
			itemIndex,
			description:
				'По спецификации Avito минимальное значение X-Employee-Of равно 1. Оставьте 0, чтобы не отправлять заголовок.',
		});
	}

	return { 'X-Employee-Of': String(companyId) };
}
