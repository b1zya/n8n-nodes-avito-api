import type { IExecuteFunctions } from 'n8n-workflow';
import { avitoApiRequest, validateRequiredFields } from '../GenericFunctions';

/**
 * Статистика по конкретной выгрузке
 * API: GET /autoload/v3/reports/{report_id}
 * Scope: autoload:reports
 */
export async function getReportById(this: IExecuteFunctions, itemIndex: number) {
	const reportId = this.getNodeParameter('reportId', itemIndex) as number;

	validateRequiredFields.call(this, this, itemIndex, { reportId });

	return await avitoApiRequest.call(
		this,
		'GET',
		`/autoload/v3/reports/${reportId}`,
		undefined,
		undefined,
		itemIndex,
	);
}