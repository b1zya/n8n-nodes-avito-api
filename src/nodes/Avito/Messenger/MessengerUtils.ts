import type { IExecuteFunctions, IDataObject, IHttpRequestOptions, JsonObject } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import { randomBytes } from 'node:crypto';
import { avitoApiRequest } from '../GenericFunctions';
import { getErrorStatus } from '../types/AvitoTypes';

const MAX_UPLOAD_IMAGE_SIZE_BYTES = 24 * 1024 * 1024;

const CRLF = '\r\n';

/**
 * Убирает CR, LF и кавычки из значений заголовков multipart.
 * Без этого имя файла из бинарных данных может разорвать тело запроса (CRLF-инъекция).
 */
function sanitizeMultipartHeaderValue(value: string): string {
	return value.replace(/[\r\n"]/g, '');
}

/**
 * Собирает тело multipart/form-data с одним файлом.
 * Пакет form-data намеренно не используется: community-ноды не должны тянуть runtime-зависимости
 * (правило @n8n/community-nodes/no-runtime-dependencies).
 */
function buildSingleFileMultipartBody(
	fieldName: string,
	fileBuffer: Buffer,
	fileName: string,
	mimeType: string,
): { body: Buffer; contentType: string } {
	const boundary = `----n8nAvitoBoundary${randomBytes(16).toString('hex')}`;
	const head = Buffer.from(
		`--${boundary}${CRLF}` +
			`Content-Disposition: form-data; name="${sanitizeMultipartHeaderValue(fieldName)}"; ` +
			`filename="${sanitizeMultipartHeaderValue(fileName)}"${CRLF}` +
			`Content-Type: ${sanitizeMultipartHeaderValue(mimeType)}${CRLF}${CRLF}`,
		'utf8',
	);
	const tail = Buffer.from(`${CRLF}--${boundary}--${CRLF}`, 'utf8');

	return {
		body: Buffer.concat([head, fileBuffer, tail]),
		contentType: `multipart/form-data; boundary=${boundary}`,
	};
}

export async function messengerApiRequest<T = IDataObject>(
	context: IExecuteFunctions,
	method: 'GET' | 'POST',
	endpoint: string,
	body: IDataObject | undefined,
	itemIndex: number,
	qs?: IDataObject,
): Promise<T> {
	return await avitoApiRequest.call(context, method, endpoint, body, qs, itemIndex) as unknown as T;
}

export async function messengerUploadImageRequest(
	this: IExecuteFunctions,
	userId: number,
	binaryPropertyName: string,
	itemIndex: number,
): Promise<IDataObject> {
	const item = this.getInputData()[itemIndex];
	const binaryData = item.binary?.[binaryPropertyName];

	if (!binaryData) {
		throw new NodeOperationError(this.getNode(), `Binary property '${binaryPropertyName}' was not found`, {
			itemIndex,
		});
	}

	const buffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);

	if (buffer.length > MAX_UPLOAD_IMAGE_SIZE_BYTES) {
		throw new NodeOperationError(this.getNode(), 'Image file is larger than 24 MB', {
			itemIndex,
			description: 'Avito Messenger uploadImages accepts a single image up to 24 MB.',
		});
	}

	const { body, contentType } = buildSingleFileMultipartBody(
		'uploadfile[]',
		buffer,
		binaryData.fileName ?? 'image',
		binaryData.mimeType ?? 'application/octet-stream',
	);

	const options: IHttpRequestOptions = {
		method: 'POST',
		url: `https://api.avito.ru/messenger/v1/accounts/${userId}/uploadImages`,
		headers: { 'Content-Type': contentType },
		body,
		json: true,
	};

	try {
		return await this.helpers.httpRequestWithAuthentication.call(
			this,
			'avitoOAuth2Api',
			options,
			{
				oauth2: {
					includeCredentialsOnRefreshOnBody: true,
					tokenType: 'Bearer',
					keepBearer: true,
				},
			},
		) as IDataObject;
	} catch (error: unknown) {
		const errorStatus = getErrorStatus(error);

		if (errorStatus === 400) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				itemIndex,
				message: 'Bad image upload request',
				description: 'Check that the binary input is a single JPEG, HEIC, GIF, BMP, or PNG image within Avito limits.',
			});
		}

		throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex });
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
	maxValue?: number,
): void {
	if (!Number.isInteger(value) || value < 0) {
		throw new NodeOperationError(context.getNode(), `${fieldName} must be a non-negative integer`, {
			itemIndex,
		});
	}

	if (maxValue !== undefined && value > maxValue) {
		throw new NodeOperationError(context.getNode(), `${fieldName} must be less than or equal to ${maxValue}`, {
			itemIndex,
		});
	}
}

export function parseCommaSeparatedIntegerList(
	context: IExecuteFunctions,
	itemIndex: number,
	fieldName: string,
	value: string,
	required: boolean,
): string | undefined {
	const trimmedValue = value.trim();

	if (!trimmedValue) {
		if (required) {
			throw new NodeOperationError(context.getNode(), `${fieldName} is required`, { itemIndex });
		}

		return undefined;
	}

	const values = trimmedValue.split(',').map((entry) => entry.trim()).filter(Boolean);

	if (values.length === 0) {
		throw new NodeOperationError(context.getNode(), `${fieldName} must contain at least one value`, {
			itemIndex,
		});
	}

	for (const entry of values) {
		const id = Number(entry);
		if (!Number.isInteger(id) || id <= 0) {
			throw new NodeOperationError(context.getNode(), `${fieldName} contains invalid ID: ${entry}`, {
				itemIndex,
			});
		}
	}

	return values.join(',');
}

export function parseCommaSeparatedStringList(
	context: IExecuteFunctions,
	itemIndex: number,
	fieldName: string,
	value: string,
): string {
	const values = value.split(',').map((entry) => entry.trim()).filter(Boolean);

	if (values.length === 0) {
		throw new NodeOperationError(context.getNode(), `${fieldName} must contain at least one value`, {
			itemIndex,
		});
	}

	return values.join(',');
}

export function parseJsonArray(
	context: IExecuteFunctions,
	itemIndex: number,
	fieldName: string,
	value: string,
): unknown[] {
	try {
		const parsed = JSON.parse(value) as unknown;

		if (!Array.isArray(parsed)) {
			throw new Error('JSON value is not an array');
		}

		if (parsed.length === 0) {
			throw new Error('JSON array is empty');
		}

		return parsed;
	} catch (error: unknown) {
		throw new NodeOperationError(context.getNode(), `${fieldName} must be a valid non-empty JSON array`, {
			itemIndex,
			description: error instanceof Error ? error.message : undefined,
		});
	}
}

export function validateUrl(
	context: IExecuteFunctions,
	itemIndex: number,
	fieldName: string,
	value: string,
): string {
	const normalizedValue = validateRequiredString(context, itemIndex, fieldName, value);

	try {
		new URL(normalizedValue);
	} catch {
		throw new NodeOperationError(context.getNode(), `${fieldName} must be a valid URL`, { itemIndex });
	}

	return normalizedValue;
}
