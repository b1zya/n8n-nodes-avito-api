import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export function parsePositiveIntegerList(
	context: IExecuteFunctions,
	itemIndex: number,
	rawValue: string,
	fieldName: string,
): number[] {
	if (!rawValue || typeof rawValue !== 'string' || rawValue.trim() === '') {
		throw new NodeOperationError(context.getNode(), `Поле "${fieldName}" обязательно`, { itemIndex });
	}

	const rawIds = rawValue.split(',').map((value) => value.trim()).filter(Boolean);
	const ids = rawIds.map((value) => Number(value));
	const invalid = rawIds.filter((value, index) => !Number.isInteger(ids[index]) || ids[index] <= 0);

	if (invalid.length > 0) {
		throw new NodeOperationError(
			context.getNode(),
			`Поле "${fieldName}" содержит некорректные ID: ${invalid.join(', ')}`,
			{ itemIndex },
		);
	}

	if (ids.length === 0) {
		throw new NodeOperationError(context.getNode(), `Укажите хотя бы один ID в поле "${fieldName}"`, {
			itemIndex,
		});
	}

	return ids;
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

export function validateDateTimeRange(
	context: IExecuteFunctions,
	itemIndex: number,
	dateTimeFrom: string,
	dateTimeTo: string,
): void {
	if (new Date(dateTimeFrom) > new Date(dateTimeTo)) {
		throw new NodeOperationError(
			context.getNode(),
			`Дата начала (${dateTimeFrom}) позже даты окончания (${dateTimeTo}).`,
			{ itemIndex },
		);
	}
}

export function getDispatches(context: IExecuteFunctions, itemIndex: number): IDataObject[] {
	const collection = context.getNodeParameter('specialOffersDispatches', itemIndex, {}) as {
		dispatches?: IDataObject[];
	};
	const dispatches = collection.dispatches ?? [];

	if (!Array.isArray(dispatches) || dispatches.length === 0) {
		throw new NodeOperationError(context.getNode(), 'Добавьте хотя бы одну рассылку для подтверждения', {
			itemIndex,
		});
	}

	return dispatches.map((dispatch, index) => {
		const dispatchId = Number(dispatch.dispatchId);
		const recipientsCount = Number(dispatch.recipientsCount);
		const offerSlug = String(dispatch.offerSlug ?? '').trim();
		const discountValue = Number(dispatch.discountValue ?? 0);

		if (!Number.isInteger(dispatchId) || dispatchId <= 0) {
			throw new NodeOperationError(context.getNode(), `Некорректный ID рассылки в строке ${index + 1}`, {
				itemIndex,
			});
		}
		if (!Number.isInteger(recipientsCount) || recipientsCount <= 0) {
			throw new NodeOperationError(
				context.getNode(),
				`Некорректное количество получателей в строке ${index + 1}`,
				{ itemIndex },
			);
		}
		if (!offerSlug) {
			throw new NodeOperationError(context.getNode(), `Укажите slug предложения в строке ${index + 1}`, {
				itemIndex,
			});
		}
		if (!Number.isInteger(discountValue) || discountValue < 0) {
			throw new NodeOperationError(context.getNode(), `Некорректный размер скидки в строке ${index + 1}`, {
				itemIndex,
			});
		}

		const normalized: IDataObject = {
			dispatchId,
			offerSlug,
			recipientsCount,
		};

		if (discountValue > 0) {
			normalized.discountValue = discountValue;
		}

		return normalized;
	});
}
