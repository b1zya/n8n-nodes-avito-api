import type { IExecuteFunctions } from 'n8n-workflow';
import { avitoApiRequest, validateRequiredFields } from '../GenericFunctions';

/**
 * Запрос на удаление ответа на отзыв
 * API: DELETE /ratings/v1/answers/{answer_id}
 * Scope: ratings:write
 */
export async function removeAnswer(this: IExecuteFunctions, itemIndex: number) {
	const answerId = this.getNodeParameter('answerId', itemIndex) as number;

	// Валидация обязательных полей
	validateRequiredFields.call(this, this, itemIndex, { answerId });

	// Выполняем DELETE запрос с ID ответа в URL
	return await avitoApiRequest.call(
		this,
		'DELETE',
		`/ratings/v1/answers/${answerId}`,
		undefined,
		undefined,
		itemIndex,
	);
}