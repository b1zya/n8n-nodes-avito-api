import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';
import type { DynamicRequestBody } from '../types/AvitoTypes';


export async function applyVas(this: IExecuteFunctions, itemIndex: number) {
	const itemId = this.getNodeParameter('itemId', itemIndex) as number;
	const slugs = (this.getNodeParameter('slugs', itemIndex) as string)
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);

	// Валидация обязательных полей
	if (!itemId) throw new NodeOperationError(this.getNode(), 'Укажите ID объявления', { itemIndex });
	if (!slugs.length)
		throw new NodeOperationError(this.getNode(), 'Укажите хотя бы одну услугу (slug)', {
			itemIndex,
		});

	// Опциональное поле stickers
	const stickersParam = this.getNodeParameter('stickers', itemIndex, '') as string;

	// Формируем тело запроса
	const body: DynamicRequestBody = { slugs };

	// Добавляем stickers только если они указаны
	if (stickersParam) {
		const stickers = stickersParam
			.split(',')
			.map((s) => Number(s.trim()))
			.filter((id) => !isNaN(id) && id > 0);

		// Проверка на максимум 3 значка
		if (stickers.length > 3) {
			throw new NodeOperationError(this.getNode(), 'Можно выбрать максимум 3 значка', {
				itemIndex,
			});
		}

		// Проверка соответствия количества значков и услуги stickerpack_x
		const stickerpackSlug = slugs.find((s) => s.startsWith('stickerpack_x'));
		if (stickers.length > 0 && stickerpackSlug) {
			const expectedCount = parseInt(stickerpackSlug.replace('stickerpack_x', ''));
			if (stickers.length !== expectedCount) {
				throw new NodeOperationError(
					this.getNode(),
					`Количество значков (${stickers.length}) не соответствует выбранной услуге ${stickerpackSlug} (ожидается ${expectedCount})`,
					{ itemIndex },
				);
			}
		}

		body.stickers = stickers;
	}

	return await avitoApiRequest.call(
		this,
		'PUT',
		`/core/v2/items/${itemId}/vas/`,
		body as Record<string, unknown>,
		undefined,
		itemIndex,
	);
}