import type { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { NodeOperationError, sleep } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';

export function getCpaHeaders(this: IExecuteFunctions, itemIndex: number): IDataObject {
	const xSource = this.getNodeParameter('xSource', itemIndex, '') as string;
	const normalizedXSource = xSource.trim();

	if (!normalizedXSource) {
		throw new NodeOperationError(this.getNode(), 'X-Source is required for CPA API requests', {
			itemIndex,
			description:
				'Укажите имя сервиса, отправляющего запрос. Оно будет передано в заголовке X-Source.',
		});
	}

	return { 'X-Source': normalizedXSource };
}

export async function cpaApiRequest<T extends IDataObject = IDataObject>(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject | string | undefined,
	itemIndex: number,
): Promise<T> {
	const enableDelay = this.getNodeParameter('enableCpaDelay', itemIndex, false) as boolean;
	const requestDelay = this.getNodeParameter('cpaRequestDelay', itemIndex, 60000) as number;

	if (requestDelay < 0) {
		throw new NodeOperationError(
			this.getNode(),
			'CPA request delay must be greater than or equal to 0',
			{
				itemIndex,
			},
		);
	}

	if (enableDelay && itemIndex > 0 && requestDelay > 0) {
		await sleep(requestDelay);
	}

	return (await avitoApiRequest.call(
		this,
		method,
		endpoint,
		body,
		undefined,
		itemIndex,
		getCpaHeaders.call(this, itemIndex),
	)) as T;
}

export function validatePositiveInteger(
	context: IExecuteFunctions,
	itemIndex: number,
	fieldName: string,
	value: number,
	maxValue?: number,
): void {
	if (!Number.isInteger(value) || value <= 0) {
		throw new NodeOperationError(context.getNode(), `${fieldName} must be a positive integer`, {
			itemIndex,
		});
	}

	if (maxValue !== undefined && value > maxValue) {
		throw new NodeOperationError(
			context.getNode(),
			`${fieldName} must be less than or equal to ${maxValue}`,
			{
				itemIndex,
			},
		);
	}
}

export function validateNonNegativeInteger(
	context: IExecuteFunctions,
	itemIndex: number,
	fieldName: string,
	value: number,
): void {
	if (!Number.isInteger(value) || value < 0) {
		throw new NodeOperationError(context.getNode(), `${fieldName} must be a non-negative integer`, {
			itemIndex,
		});
	}
}

export function validateRequiredString(
	context: IExecuteFunctions,
	itemIndex: number,
	fieldName: string,
	value: string,
): string {
	const normalizedValue = value.trim();

	if (!normalizedValue) {
		throw new NodeOperationError(context.getNode(), `${fieldName} is required`, { itemIndex });
	}

	return normalizedValue;
}

export function validateDateTime(
	context: IExecuteFunctions,
	itemIndex: number,
	fieldName: string,
	value: string,
): string {
	const normalizedValue = validateRequiredString(context, itemIndex, fieldName, value);
	const date = new Date(normalizedValue);

	if (Number.isNaN(date.getTime())) {
		throw new NodeOperationError(
			context.getNode(),
			`${fieldName} must be a valid RFC3339 date-time string`,
			{
				itemIndex,
			},
		);
	}

	return date.toISOString().replace('.000Z', 'Z');
}
