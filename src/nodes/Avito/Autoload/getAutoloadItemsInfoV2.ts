import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';

/**
 * Получение данных по конкретным объявлениям по ID из файла
 * API: GET /autoload/v2/reports/items
 * Scope: autoload:reports
 */
export async function getAutoloadItemsInfoV2(this: IExecuteFunctions, itemIndex: number) {
	const autoloadItemsQuery = this.getNodeParameter('autoloadItemsQuery', itemIndex) as string;

	// Валидация обязательного параметра
	if (!autoloadItemsQuery || !autoloadItemsQuery.trim()) {
		throw new NodeOperationError(
			this.getNode(),
			'Укажите ID объявлений из файла автозагрузки',
			{ itemIndex }
		);
	}

	// Дополнительная валидация - проверим количество ID (максимум 100)
	const cleanQuery = autoloadItemsQuery.trim();
	const idsArray = cleanQuery.split(/[,|]/).map(id => id.trim()).filter(Boolean);
	
	if (idsArray.length === 0) {
		throw new NodeOperationError(
			this.getNode(),
			'Укажите хотя бы один ID объявления',
			{ itemIndex }
		);
	}

	if (idsArray.length > 100) {
		throw new NodeOperationError(
			this.getNode(),
			'Максимум 100 ID объявлений за один запрос',
			{ itemIndex }
		);
	}

	// Выполняем запрос к API
	return await avitoApiRequest.call(
		this,
		'GET',
		'/autoload/v2/reports/items',
		undefined,
		{ query: cleanQuery },
		itemIndex,
	);
}