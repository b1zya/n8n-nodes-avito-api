import type { IExecuteFunctions } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';

/**
 * Полная информация о статусе пользователя в иерархии аккаунтов.
 * API: GET /getAhInfoV1
 * Scope: ah:access
 * Ответ: company.isCompany и массив employees с avitoCompanyId, employeeId, isChief.
 * Заголовок X-Employee-Of в спецификации не объявлен: если запрос идет от имени
 * сотрудника, Avito сам возвращает список компаний, которым он принадлежит.
 */
export async function getAhInfo(this: IExecuteFunctions, itemIndex: number) {
	return await avitoApiRequest.call(this, 'GET', '/getAhInfoV1', undefined, undefined, itemIndex);
}
