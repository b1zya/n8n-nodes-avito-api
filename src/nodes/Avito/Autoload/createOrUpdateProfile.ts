import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';
import type { DynamicRequestBody } from '../types/AvitoTypes';

/**
 * Создание или обновление настроек профиля автозагрузки
 * API: POST /autoload/v2/profile
 * Scope: autoload:reports
 *
 * Соответствует документации: https://developers.avito.ru/api-catalog/autoload/documentation#operation/createOrUpdateProfileV2
 */
export async function createOrUpdateProfile(this: IExecuteFunctions, itemIndex: number) {
	// Получаем все обязательные поля согласно API
	const autoloadEnabled = this.getNodeParameter('autoloadEnabled', itemIndex) as boolean;
	const reportEmail = this.getNodeParameter('reportEmail', itemIndex) as string;
	const feedsDataRaw = this.getNodeParameter('feedsData', itemIndex) as string;
	const scheduleRaw = this.getNodeParameter('schedule', itemIndex) as string;

	// Получаем опциональное поле agreement
	const agreement = this.getNodeParameter('agreement', itemIndex, undefined) as boolean | undefined;

	// Валидация обязательных полей
	if (!reportEmail || !reportEmail.trim()) {
		throw new NodeOperationError(this.getNode(), 'Укажите email для отчетов', { itemIndex });
	}

	// Формируем тело запроса согласно API v2
	const requestBody: DynamicRequestBody = {
		autoload_enabled: autoloadEnabled,
		report_email: reportEmail.trim(),
	};

	// Добавляем agreement только если указано
	if (agreement !== undefined) {
		requestBody.agreement = agreement;
	}

	// Парсинг и валидация feeds_data
	try {
		const feedsData = JSON.parse(feedsDataRaw);

		// Валидация структуры feeds_data
		if (feedsData !== null) {
			if (!Array.isArray(feedsData)) {
				throw new NodeOperationError(this.getNode(), 'Данные Фидов должны быть массивом объектов', {
					itemIndex,
				});
			}

			for (const feed of feedsData) {
				if (!feed.feed_name || !feed.feed_url) {
					throw new NodeOperationError(
						this.getNode(),
						'Каждый фид должен содержать feed_name и feed_url',
						{ itemIndex },
					);
				}

				// Валидация URL
				if (!feed.feed_url.startsWith('http://') && !feed.feed_url.startsWith('https://')) {
					throw new NodeOperationError(
						this.getNode(),
						'feed_url должен начинаться с http:// или https://',
						{ itemIndex },
					);
				}
			}
		}

		requestBody.feeds_data = feedsData;
	} catch (e: unknown) {
		if (e instanceof NodeOperationError) {
			throw new NodeOperationError(this.getNode(), e.message, { itemIndex });
		}
		throw new NodeOperationError(
			this.getNode(),
			'Некорректный JSON в поле "Данные Фидов". Ожидается массив объектов с feed_name и feed_url',
			{ itemIndex },
		);
	}

	// Парсинг и валидация schedule
	try {
		const schedule = JSON.parse(scheduleRaw);

		// Валидация структуры schedule
		if (!Array.isArray(schedule)) {
			throw new NodeOperationError(this.getNode(), 'Расписание должно быть массивом объектов', {
				itemIndex,
			});
		}

		for (const scheduleItem of schedule) {
			// Проверка обязательных полей
			if (
				typeof scheduleItem.rate !== 'number' ||
				!Array.isArray(scheduleItem.weekdays) ||
				!Array.isArray(scheduleItem.time_slots)
			) {
				throw new NodeOperationError(
					this.getNode(),
					'Каждый элемент расписания должен содержать rate (число), weekdays (массив) и time_slots (массив)',
					{ itemIndex },
				);
			}

			// Валидация rate
			if (scheduleItem.rate <= 0) {
				throw new NodeOperationError(this.getNode(), 'rate должен быть положительным числом', {
					itemIndex,
				});
			}

			// Валидация weekdays
			for (const weekday of scheduleItem.weekdays) {
				if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
					throw new NodeOperationError(
						this.getNode(),
						'weekdays должны быть целыми числами от 0 до 6 (0=Понедельник, 6=Воскресенье)',
						{ itemIndex },
					);
				}
			}

			// Валидация time_slots
			for (const timeSlot of scheduleItem.time_slots) {
				if (!Number.isInteger(timeSlot) || timeSlot < 0 || timeSlot > 23) {
					throw new NodeOperationError(
						this.getNode(),
						'time_slots должны быть целыми числами от 0 до 23 (часы)',
						{ itemIndex },
					);
				}
			}
		}

		requestBody.schedule = schedule;
	} catch (e: unknown) {
		if (e instanceof NodeOperationError) {
			throw new NodeOperationError(this.getNode(), e.message, { itemIndex });
		}
		throw new NodeOperationError(
			this.getNode(),
			'Некорректный JSON в поле "Расписание". Ожидается массив объектов с rate, weekdays и time_slots',
			{ itemIndex },
		);
	}

	return await avitoApiRequest.call(
		this,
		'POST',
		'/autoload/v2/profile',
		requestBody as Record<string, unknown>,
		undefined,
		itemIndex,
	);
}
