import type { IExecuteFunctions } from 'n8n-workflow';
import { avitoApiRequest } from '../GenericFunctions';

/**
 * Загрузка файла автозагрузки по ссылке из настроек профиля
 * API: POST /autoload/v1/upload
 * Scope: autoload:reports
 * 
 * Использует URL, который уже указан в настройках автозагрузки профиля Авито.
 * Не требует передачи дополнительных параметров.
 */
export async function uploadFile(this: IExecuteFunctions, itemIndex: number) {
	// Простой POST запрос без тела - использует URL из настроек профиля
	return await avitoApiRequest.call(
		this,
		'POST',
		'/autoload/v1/upload',
		undefined, // Нет тела запроса
		undefined, // Нет query параметров
		itemIndex,
	);
}