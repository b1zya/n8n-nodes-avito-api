// nodes/Avito/utils/date_normalize.ts

import type { INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

/**
 * Универсальная нормализация к строке.
 * Поддерживает string | number | resourceLocator { __rl: true, value }.
 */
export function normalizeToString(v: unknown): string {
	if (v == null) return '';
	if (typeof v === 'string' || typeof v === 'number') return String(v);
	const resourceLocator = v as { __rl?: boolean; value?: unknown };
	if (resourceLocator && typeof resourceLocator === 'object' && '__rl' in resourceLocator)
		return String(resourceLocator.value ?? '');
	return '';
}

/**
 * Нормализация «списка ID»:
 * - принимает unknown (строка "1,2", массив значений, number, resourceLocator)
 * - возвращает массив строк (уже тримнутых и без пустых)
 */
export function normalizeIdsInput(v: unknown): string[] {
	if (v == null) return [];
	if (Array.isArray(v)) return v.map((x) => normalizeToString(x)).filter(Boolean);

	const s = normalizeToString(v).trim();
	if (!s) return [];
	return s
		.split(',')
		.map((p) => p.trim())
		.filter(Boolean);
}

/**
 * Преобразовать входную строку даты к формату YYYY-MM-DD.
 * Бросает исключение, если дата некорректна.
 */
export function toYYYYMMDD(dateStr: string): string {
	if (!dateStr) return dateStr;

	const dateOnlyMatch = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
	if (dateOnlyMatch) {
		const [, year, month, day] = dateOnlyMatch;
		const utcDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
		const normalized = utcDate.toISOString().slice(0, 10);

		if (normalized === `${year}-${month}-${day}`) {
			return normalized;
		}
	}

	const d = new Date(dateStr);
	if (isNaN(d.getTime())) {
		throw new Error(`Некорректная дата: ${dateStr}`);
	}
	return d.toISOString().slice(0, 10);
}

/**
 * Разница между датами в днях (включительно) в UTC.
 * Пример: 2025-01-01..2025-01-01 => 1; 2025-01-01..2025-01-02 => 2
 */
export function daysDiffInclusiveUTC(aYYYYMMDD: string, bYYYYMMDD: string): number {
	const [ay, am, ad] = aYYYYMMDD.split('-').map(Number);
	const [by, bm, bd] = bYYYYMMDD.split('-').map(Number);
	const a = Date.UTC(ay, am - 1, ad, 0, 0, 0, 0);
	const b = Date.UTC(by, bm - 1, bd, 0, 0, 0, 0);
	const msPerDay = 24 * 60 * 60 * 1000;
	return Math.floor((b - a) / msPerDay) + 1;
}

/**
 * Добавить/вычесть дни в UTC, вернуть YYYY-MM-DD.
 * delta может быть отрицательным.
 */
export function addDaysUTC(yyyyMMdd: string, delta: number): string {
	const [y, m, d] = yyyyMMdd.split('-').map(Number);
	const t = Date.UTC(y, m - 1, d, 0, 0, 0, 0);
	return new Date(t + delta * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function isStrictYYYYMMDD(value: string): boolean {
	if (typeof value !== 'string') return false;
	const re = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
	return re.test(value);
}

/**
 * Безопасный JSON.parse с пользовательским сообщением.
 */
export function safeJsonParse<T = unknown>(
	raw: unknown,
	errMsg: string,
	node: INode,
	itemIndex: number,
): T {
	if (typeof raw !== 'string') {
		throw new NodeOperationError(node, errMsg, { itemIndex });
	}
	try {
		return JSON.parse(raw) as T;
	} catch {
		throw new NodeOperationError(node, errMsg, { itemIndex });
	}
}
