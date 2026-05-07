import type { IExecuteFunctions } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';

/**
 * Статистика по последней выгрузке
 * API: GET /autoload/v3/reports/last_completed_report
 * Scope: autoload:reports
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