import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { avitoApiRequest, validateRequiredFields } from '../GenericFunctions';

/**
 * Отправка ответа на отзыв
 * API: POST /ratings/v1/answers
 * Scope: ratings:write
 */
export async function createAnswer(this: IExecuteFunctions, itemIndex: number) {
	const reviewId = this.getNodeParameter('reviewId', itemIndex) as number;
	const answerText = this.getNodeParameter('answerText', itemIndex) as string;

	// Валидация обязательных полей
	validateRequiredFields.call(this, this, itemIndex, { reviewId, answerText });

	// Дополнительная валидация текста ответа
	if (!answerText.trim()) {
		throw new NodeOperationError(this.getNode(), 'Текст ответа не может быть пустым', {
			itemIndex,
		});
	}

	// Проверка длины текста (разумные ограничения)
	if (answerText.length > 4000) {
		throw new NodeOperationError(
			this.getNode(),
			'Текст ответа слишком длинный (максимум 4000 символов)',
			{ itemIndex },
		);
	}

	// Формируем тело запроса согласно API
	const requestBody = {
		reviewId,
		message: answerText.trim(),
	};

	return await avitoApiRequest.call(
		this,
		'POST',
		'/ratings/v1/answers',
		requestBody,
		undefined,
		itemIndex,
	);
}
