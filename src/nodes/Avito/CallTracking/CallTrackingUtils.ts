import type { IExecuteFunctions, IDataObject, IHttpRequestMethods, JsonObject } from 'n8n-workflow';
import { NodeApiError, NodeOperationError, sleep } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';
import { getErrorStatus } from '../types/AvitoTypes';

export async function callTrackingApiRequest<T extends IDataObject = IDataObject>(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject | undefined,
	itemIndex: number,
	qs?: IDataObject,
): Promise<T> {
	await applyCallTrackingDelay.call(this, itemIndex);

	return await avitoApiRequest.call(this, method, endpoint, body, qs, itemIndex) as T;
}

export async function callTrackingBinaryRequest(
	this: IExecuteFunctions,
	endpoint: string,
	qs: IDataObject,
	itemIndex: number,
): Promise<Buffer> {
	await applyCallTrackingDelay.call(this, itemIndex);

	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'avitoOAuth2Api',
			{
				method: 'GET',
				url: `https://api.avito.ru${endpoint}`,
				headers: {
					Accept: 'audio/mpeg',
				},
				qs,
				encoding: 'arraybuffer',
				json: false,
				timeout: 60000,
			},
			{
				oauth2: {
					includeCredentialsOnRefreshOnBody: true,
					tokenType: 'Bearer',
					keepBearer: true,
				},
			},
		);

		return Buffer.isBuffer(response) ? response : Buffer.from(response as ArrayBuffer);
	} catch (error: unknown) {
		const errorStatus = getErrorStatus(error);

		if (errorStatus === 425) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				itemIndex,
				message: 'Call record is not ready yet',
				description: 'Avito says the call record is too early to fetch. Documentation says records usually become available within 30 minutes after the call ends.',
			});
		}

		throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex });
	}
}

export async function applyCallTrackingDelay(this: IExecuteFunctions, itemIndex: number): Promise<void> {
	const enableDelay = this.getNodeParameter('enableCallTrackingDelay', itemIndex, false) as boolean;
	const requestDelay = this.getNodeParameter('callTrackingRequestDelay', itemIndex, 12000) as number;

	if (requestDelay < 0) {
		throw new NodeOperationError(this.getNode(), 'CallTracking request delay must be greater than or equal to 0', {
			itemIndex,
		});
	}

	if (enableDelay && itemIndex > 0 && requestDelay > 0) {
		await sleep(requestDelay);
	}
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
		throw new NodeOperationError(context.getNode(), `${fieldName} must be less than or equal to ${maxValue}`, {
			itemIndex,
		});
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

export function validateDateTime(
	context: IExecuteFunctions,
	itemIndex: number,
	fieldName: string,
	value: string,
): string {
	const normalizedValue = value.trim();

	if (!normalizedValue) {
		throw new NodeOperationError(context.getNode(), `${fieldName} is required`, { itemIndex });
	}

	const date = new Date(normalizedValue);
	if (Number.isNaN(date.getTime())) {
		throw new NodeOperationError(context.getNode(), `${fieldName} must be a valid RFC3339 date-time string`, {
			itemIndex,
		});
	}

	return date.toISOString().replace('.000Z', 'Z');
}

export function validateDateTimeRange(
	context: IExecuteFunctions,
	itemIndex: number,
	dateTimeFrom: string,
	dateTimeTo: string,
): void {
	const fromDate = new Date(dateTimeFrom);
	const toDate = new Date(dateTimeTo);

	if (toDate.getTime() < fromDate.getTime()) {
		throw new NodeOperationError(context.getNode(), 'dateTimeTo must be greater than or equal to dateTimeFrom', {
			itemIndex,
			description: 'Дата и время "до" не могут быть раньше даты и времени "от".',
		});
	}

	const maxDateTimeTo = new Date(fromDate);
	maxDateTimeTo.setMonth(maxDateTimeTo.getMonth() + 3);

	if (toDate.getTime() > maxDateTimeTo.getTime()) {
		throw new NodeOperationError(context.getNode(), 'dateTimeTo must not be later than dateTimeFrom plus 3 months', {
			itemIndex,
			description: 'По документации Avito максимальное значение dateTimeTo - dateTimeFrom + 3 месяца.',
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
