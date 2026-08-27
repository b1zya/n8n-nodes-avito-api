import type { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface BbipItem {
	itemId: number;
	duration: number;
	oldPrice: number;
	price: number;
}

export async function promotionApiRequest<T = IDataObject>(
	context: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject | undefined,
	itemIndex: number,
	employeeOf: number = 0,
): Promise<T> {
	return await avitoApiRequest.call(
		context,
		method,
		endpoint,
		body,
		undefined,
		itemIndex,
		employeeOf ? { 'X-Employee-Of': String(employeeOf) } : undefined,
	) as unknown as T;
}

/**
 * Идентификатор компании для заголовка X-Employee-Of.
 * Устаревший X-Is-Employee (булев флаг) не используется: с 26.05.2026 Avito помечает его
 * deprecated и требует передавать конкретный ID компании, от имени которой работает сотрудник.
 * 0 означает, что запрос идёт от личного аккаунта и заголовок не отправляется.
 */
export function getPromotionEmployeeOf(context: IExecuteFunctions, itemIndex: number): number {
	const employeeOf = context.getNodeParameter('promotionEmployeeOf', itemIndex, 0) as number;

	if (!employeeOf) {
		return 0;
	}

	if (!Number.isInteger(employeeOf) || employeeOf < 1) {
		throw new NodeOperationError(context.getNode(), 'X-Employee-Of must be a positive integer', {
			itemIndex,
			description: 'По документации Avito минимальное значение X-Employee-Of равно 1. Оставьте 0, чтобы работать от личного аккаунта.',
		});
	}

	return employeeOf;
}

export function validatePromotionItemIds(
	context: IExecuteFunctions,
	itemIndex: number,
	value: string,
	maxCount: number = 100,
): number[] {
	if (typeof value !== 'string' || !value.trim()) {
		throw new NodeOperationError(context.getNode(), 'Item IDs are required', { itemIndex });
	}

	const rawIds = value.split(',').map((entry) => entry.trim()).filter(Boolean);
	const ids = rawIds.map((entry) => Number(entry));

	if (ids.length === 0) {
		throw new NodeOperationError(context.getNode(), 'At least one item ID is required', { itemIndex });
	}

	if (ids.length > maxCount) {
		throw new NodeOperationError(context.getNode(), `Maximum ${maxCount} item IDs allowed per request`, {
			itemIndex,
		});
	}

	const invalidId = ids.find((id) => !Number.isInteger(id) || id <= 0);
	if (invalidId !== undefined) {
		throw new NodeOperationError(context.getNode(), 'Item IDs must be positive integers', {
			itemIndex,
			description: `Invalid value: ${invalidId}`,
		});
	}

	return ids;
}

export function validatePositiveInteger(
	context: IExecuteFunctions,
	itemIndex: number,
	fieldName: string,
	value: number,
	maxValue?: number,
): void {
	if (!Number.isInteger(value) || value <= 0) {
		throw new NodeOperationError(context.getNode(), `${fieldName} must be a positive integer`, { itemIndex });
	}

	if (maxValue !== undefined && value > maxValue) {
		throw new NodeOperationError(context.getNode(), `${fieldName} must be less than or equal to ${maxValue}`, {
			itemIndex,
		});
	}
}

export function validateUuid(
	context: IExecuteFunctions,
	itemIndex: number,
	fieldName: string,
	value: string,
): string {
	const normalizedValue = value.trim();

	if (!UUID_PATTERN.test(normalizedValue)) {
		throw new NodeOperationError(context.getNode(), `${fieldName} must be a valid UUID`, { itemIndex });
	}

	return normalizedValue;
}

export function getBbipItems(context: IExecuteFunctions, itemIndex: number): BbipItem[] {
	const inputMode = context.getNodeParameter('promotionBbipItemsInputMode', itemIndex, 'json') as string;
	const rawItems = inputMode === 'ui'
		? getBbipItemsFromUi(context, itemIndex)
		: getBbipItemsFromJson(context, itemIndex);

	if (rawItems.length === 0) {
		throw new NodeOperationError(context.getNode(), 'At least one BBIP item is required', { itemIndex });
	}

	if (rawItems.length > 100) {
		throw new NodeOperationError(context.getNode(), 'Maximum 100 BBIP items allowed per request', {
			itemIndex,
		});
	}

	return rawItems.map((rawItem, index) => normalizeBbipItem(context, itemIndex, rawItem, index));
}

function getBbipItemsFromJson(context: IExecuteFunctions, itemIndex: number): unknown[] {
	const rawJson = context.getNodeParameter('promotionBbipItemsJson', itemIndex) as string;

	try {
		const parsed = JSON.parse(rawJson) as unknown;

		if (!Array.isArray(parsed)) {
			throw new Error('JSON value is not an array');
		}

		return parsed;
	} catch (error) {
		throw new NodeOperationError(context.getNode(), 'BBIP Items JSON must be a valid JSON array', {
			itemIndex,
			description: error instanceof Error ? error.message : undefined,
		});
	}
}

function getBbipItemsFromUi(context: IExecuteFunctions, itemIndex: number): unknown[] {
	const collection = context.getNodeParameter('promotionBbipItemsUi', itemIndex, {}) as {
		items?: unknown[];
	};

	return Array.isArray(collection.items) ? collection.items : [];
}

function normalizeBbipItem(
	context: IExecuteFunctions,
	itemIndex: number,
	rawItem: unknown,
	index: number,
): BbipItem {
	if (!rawItem || typeof rawItem !== 'object') {
		throw new NodeOperationError(context.getNode(), `BBIP item #${index + 1} must be an object`, { itemIndex });
	}

	const item = rawItem as Record<string, unknown>;
	const normalizedItem: BbipItem = {
		itemId: Number(item.itemId),
		duration: Number(item.duration),
		oldPrice: Number(item.oldPrice),
		price: Number(item.price),
	};

	validatePositiveInteger(context, itemIndex, `items[${index}].itemId`, normalizedItem.itemId);
	validatePositiveInteger(context, itemIndex, `items[${index}].duration`, normalizedItem.duration);
	validatePositiveInteger(context, itemIndex, `items[${index}].oldPrice`, normalizedItem.oldPrice);
	validatePositiveInteger(context, itemIndex, `items[${index}].price`, normalizedItem.price);

	return normalizedItem;
}
