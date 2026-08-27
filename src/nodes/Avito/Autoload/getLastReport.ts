import type { IExecuteFunctions } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';

/**
 * Статистика по последней выгрузке
 * API: GET /autoload/v3/reports/last_completed_report
 * Scope: autoload:reports
 *
 * @deprecated Avito выводит метод из эксплуатации (getLastCompletedReportV3).
 * 08.09.2026 данные старше 7 дней станут неполными, 08.03.2027 метод удаляют (410 Gone).
 * Замена: getLastSuccessfulUpload (GET /autoload/v4/uploads/last_successful).
 */
export async function getLastReport(this: IExecuteFunctions, itemIndex: number) {
	return await avitoApiRequest.call(
		this,
		'GET',
		'/autoload/v3/reports/last_completed_report',
		undefined,
		undefined,
		itemIndex,
	);
}