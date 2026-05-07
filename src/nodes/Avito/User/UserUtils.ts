import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export function validateUserId(
	context: IExecuteFunctions,
	itemIndex: number,
	userId: number,
): void {
	if (!Number.isFinite(userId) || userId <= 0 || !Number.isInteger(userId)) {
		throw new NodeOperationError(context.getNode(), 'Укажите корректный ID пользователя (> 0)', {
			itemIndex,
		});
	}
}

export function toRfc3339Utc(
	context: IExecuteFunctions,
	itemIndex: number,
	fieldName: string,
	value: string,
): string {
	if (!value || typeof value !== 'string') {
		throw new NodeOperationError(context.getNode(), `Укажите значение поля "${fieldName}"`, {
			itemIndex,
		});
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		throw new NodeOperationError(context.getNode(), `Некорректная дата в поле "${fieldName}"`, {
			itemIndex,
		});
	}

	return date.toISOString();
}

export function validateOperationsHistoryRange(
	context: IExecuteFunctions,
	itemIndex: number,
	dateTimeFrom: string,
	dateTimeTo: string,
): void {
	const from = new Date(dateTimeFrom);
	const to = new Date(dateTimeTo);
	const now = new Date();
	const maxRangeMs = 7 * 24 * 60 * 60 * 1000;
	const oneYearAgo = new Date(now.getTime());
	oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

	if (from > to) {
		throw new NodeOperationError(
			context.getNode(),
			`Дата начала (${dateTimeFrom}) позже даты окончания (${dateTimeTo}).`,
			{ itemIndex },
		);
	}

	if (from < oneYearAgo) {
		throw new NodeOperationError(
			context.getNode(),
			'Дата начала истории операций не может быть дальше одного года в прошлое.',
			{ itemIndex },
		);
	}

	if (to.getTime() - from.getTime() > maxRangeMs) {
		throw new NodeOperationError(
			context.getNode(),
			'Диапазон истории операций должен быть не более одной недели.',
			{ itemIndex },
		);
	}
}
