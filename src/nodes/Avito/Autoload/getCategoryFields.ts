import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';
import type { AdditionalHeadersData } from '../types/AvitoTypes';

/**
 * Получение полей конкретной категории
 * API: GET /autoload/v1/user-docs/node/{node_slug}/fields
 * Scope: autoload:reports
 */
export async function getCategoryFields(this: IExecuteFunctions, itemIndex: number) {
	const nodeSlug = this.getNodeParameter('nodeSlug', itemIndex) as string;

	if (!nodeSlug || !nodeSlug.trim()) {
		throw new NodeOperationError(
			this.getNode(),
			'Укажите slug категории',
			{ itemIndex }
		);
	}

	// Получаем дополнительные заголовки из фиксированной коллекции
	const additionalHeadersData = this.getNodeParameter('additionalHeaders', itemIndex, {}) as AdditionalHeadersData;
	const additionalHeaders: Record<string, string> = {};
	
	// Преобразуем fixedCollection в объект заголовков
	if (additionalHeadersData.parameter && Array.isArray(additionalHeadersData.parameter)) {
		for (const header of additionalHeadersData.parameter) {
			if (header.name && header.value) {
				additionalHeaders[header.name] = header.value;
			}
		}
	}

	return await avitoApiRequest.call(
		this,
		'GET',
		`/autoload/v1/user-docs/node/${nodeSlug.trim()}/fields`,
		undefined,
		undefined,
		itemIndex,
		additionalHeaders,
	);
}