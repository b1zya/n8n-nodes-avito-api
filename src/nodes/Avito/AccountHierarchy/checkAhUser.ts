import type { IExecuteFunctions } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';
import { getAccountHierarchyHeaders } from './AccountHierarchyUtils';

/**
 * Информация о статусе пользователя в иерархии аккаунтов.
 * API: GET /checkAhUserV2
 * Scope: ah:access
 * Ответ: isCompany, isChief, isEmployee, avitoCompanyId.
 * Если запрос делается от имени сотрудника, нужно указать X-Employee-Of.
 * Устаревший checkAhUserV1 намеренно не поддерживается.
 */
export async function checkAhUser(this: IExecuteFunctions, itemIndex: number) {
	return await avitoApiRequest.call(
		this,
		'GET',
		'/checkAhUserV2',
		undefined,
		undefined,
		itemIndex,
		getAccountHierarchyHeaders.call(this, itemIndex),
	);
}
