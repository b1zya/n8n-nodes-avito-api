import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';

/**
 * Получение ID объявлений на Авито по ID из файла
 * API: GET /autoload/v2/items/avito_ids
 * Scope: autoload:reports
 */
export async function getAvitoIdsByAdIds(this: IExecuteFunctions, itemIndex: number) {
	const adIdsQuery = this.getNodeParameter('adIdsQuery', itemIndex) as string;

	// Валидация обязательного параметра
	if (!adIdsQuery || !adIdsQuery.trim()) {
		throw new NodeOperationError(
			this.getNode(),
			'Укажите ID объявлений из файла автозагрузки',
			{ itemIndex }
		);
	}

	// Дополнительная валидация - проверим что есть хотя бы один ID
	const cleanQuery = adIdsQuery.trim();
	const idsArray = cleanQuery.split(/[,|]/).map(id => id.trim()).filter(Boolean);
	
	if (idsArray.length === 0) {
		throw new NodeOperationError(
			this.getNode(),
			'Укажите хотя бы один ID объявления из файла',
			{ itemIndex }
		);
	}

	// Выполняем запрос к API
	return await avitoApiRequest.call(
		this,
		'GET',
		'/autoload/v2/items/avito_ids',
		undefined,
		{ query: cleanQuery },
		itemIndex,
	);
}