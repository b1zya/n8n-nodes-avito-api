import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';

/**
 * Получение ID объявлений из файла по ID на Авито
 * API: GET /autoload/v2/items/ad_ids
 * Scope: autoload:reports
 */
export async function getAdIdsByAvitoIds(this: IExecuteFunctions, itemIndex: number) {
	const avitoIdsQuery = this.getNodeParameter('avitoIdsQuery', itemIndex) as string;

	// Валидация обязательного параметра
	if (!avitoIdsQuery || !avitoIdsQuery.trim()) {
		throw new NodeOperationError(
			this.getNode(),
			'Укажите ID объявлений на Авито',
			{ itemIndex }
		);
	}

	// Дополнительная валидация - проверим что есть хотя бы один ID
	const cleanQuery = avitoIdsQuery.trim();
	const idsArray = cleanQuery.split(/[,|]/).map(id => id.trim()).filter(Boolean);
	
	if (idsArray.length === 0) {
		throw new NodeOperationError(
			this.getNode(),
			'Укажите хотя бы один ID объявления на Авито',
			{ itemIndex }
		);
	}

	// Выполняем запрос к API
	return await avitoApiRequest.call(
		this,
		'GET',
		'/autoload/v2/items/ad_ids',
		undefined,
		{ query: cleanQuery },
		itemIndex,
	);
}