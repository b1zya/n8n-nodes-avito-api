import type { IExecuteFunctions } from 'n8n-workflow';
import { avitoApiRequest, validateRequiredFields } from '../GenericFunctions';

/**
 * Статистика по конкретной выгрузке
 * API: GET /autoload/v3/reports/{report_id}
 * Scope: autoload:reports
 *
 * @deprecated Avito выводит метод из эксплуатации (getReportByIdV3).
 * 08.09.2026 данные старше 7 дней станут неполными, 08.03.2027 метод удаляют (410 Gone).
 * Замена: getUploads — статистика каждой загрузки приходит прямо в списке.
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