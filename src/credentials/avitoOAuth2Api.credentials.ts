import type { ICredentialType, INodeProperties, Icon } from 'n8n-workflow';

export class avitoOAuth2Api implements ICredentialType {
	name = 'avitoOAuth2Api';
	extends = ['oAuth2Api'];
	displayName = 'Avito OAuth2 API';
	documentationUrl = 'https://developers.avito.ru/api-catalog/auth';
	icon: Icon = { light: 'file:../../icons/avito.svg', dark: 'file:../../icons/avito.dark.svg' };

	properties: INodeProperties[] = [
		// Выбор типа авторизации
		{
			displayName: 'Тип авторизации',
			name: 'grantType',
			type: 'options',
			options: [
				{
					name: 'Client Credentials',
					value: 'clientCredentials',
					description: 'Для персонального доступа к API (проще для тестирования)',
				},
				{
					name: 'Authorization Code',
					value: 'authorizationCode',
					description: 'Для доступа к API от имени пользователей через приложение',
				},
			],
			default: 'clientCredentials',
		},

		// Скрытые технические поля - пользователю не нужно их видеть
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://api.avito.ru/token',
		},

		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			displayOptions: {
				show: {
					grantType: ['authorizationCode'],
				},
			},
			default: 'https://avito.ru/oauth',
		},

		// n8n >= 2.19.2 preserves editable scopes for inherited OAuth2 credentials
		// when the credential exposes a visible scope property.
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'string',
			displayOptions: {
				show: {
					grantType: ['authorizationCode'],
					useDynamicClientRegistration: [false],
				},
			},
			default: '',
			description:
				'Scopes for Authorization Code flow. Use comma-separated Avito scopes, for example: items:info,items:apply_bbip,user:read,special_offers:sending.',
			placeholder: 'items:info,items:apply_bbip,user:read,special_offers:sending',
		},

		// Extra Authorization URL parameters only. Do not pass scope here.
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			displayOptions: {
				show: {
					grantType: ['authorizationCode'],
					useDynamicClientRegistration: [false],
				},
			},
			default: 'pro_users_flow=true',
			description:
				'Additional query parameters for the Authorization URL. Avito Authorization Code flow uses pro_users_flow=true.',
		},

		// Подсказки для правильного заполнения разрешений
		{
			displayName: 'Для Client Credentials оставьте поле "Разрешения (Scope)" пустым',
			name: 'scopeClientCredentialsHint',
			type: 'notice',
			displayOptions: {
				show: {
					grantType: ['clientCredentials'],
				},
			},
			default: '',
		},

		{
			displayName: '<b>Для Authorization Code:</b> укажите разрешения в поле Scope через ЗАПЯТУЮ без пробелов.<br/><b>Пример Promotion v1:</b> <code>items:info,items:apply_bbip</code><br/><b>Пример User API:</b> <code>user:read,user_balance:read,user_operations:read</code><br/><b>Пример Special Offers:</b> <code>special_offers:sending</code><br/>В n8n 2.19.2+ видимое поле Scope должно сохраняться при повторном подключении credential.<br/><br/><b style="color: #d32f2f;">Для Client Credentials поле Scope не используется.</b>',
			name: 'scopeAuthCodeHint',
			type: 'notice',
			displayOptions: {
				show: {
					grantType: ['authorizationCode'],
				},
			},
			default: '',
		},

		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'body',
		},

		// eslint-disable-next-line @n8n/community-nodes/credential-password-field
		{
			displayName: 'Token Expired Status Code',
			name: 'tokenExpiredStatusCode',
			type: 'hidden',
			default: 403,
		},

		{
			displayName: 'Send Additional Body Properties',
			name: 'sendAdditionalBodyProperties',
			type: 'hidden',
			default: false,
		},

		{
			displayName: 'Additional Body Properties',
			name: 'additionalBodyProperties',
			type: 'hidden',
			default: '',
		},

		// Подробные инструкции по настройке с полным списком разрешений
		{
			displayName: '<b>Client Credentials</b> (Персональный доступ к API):<br/>• Получите Client ID и Client Secret в <a href="https://www.avito.ru/professionals/api" target="_blank">личном кабинете Авито</a><br/>• <b>Оставьте поле "Разрешения" пустым</b><br/>• Токен действует 24 часа',
			name: 'clientCredentialsNotice',
			type: 'notice',
			displayOptions: {
				show: {
					grantType: ['clientCredentials'],
				},
			},
			default: '',
		},
		{
			displayName: '<b>Authorization Code</b> (Доступ через приложение):<br/>• Зарегистрируйте приложение на <a href="https://developers.avito.ru/applications" target="_blank">developers.avito.ru</a>. Авито регистрирует только проверенные приложения партнеров.<br/>• Получите Client ID и Client Secret при регистрации<br/>• <b>Укажите необходимые разрешения</b> из списка ниже<br/><br/><b>Доступные разрешения (Scope):</b><br/>• `<b>items:info</b>` - Получение информации об объявлениях и чтение услуг продвижения<br/>• `<b>items:apply_bbip</b>` - Применение услуг продвижения BBIP<br/>• `<b>items:apply_vas</b>` - Применение дополнительных услуг VAS<br/>• `<b>stats:read</b>` - Получение статистики объявлений<br/>• `<b>special_offers:sending</b>` - Маркетинговые рассылки скидок и спецпредложений<br/>• `<b>ah:access</b>` - Взаимодействие с иерархией аккаунтов<br/>• `<b>user:read</b>` - Получение информации о пользователе<br/>• `<b>user_balance:read</b>` - Получение баланса пользователя<br/>• `<b>user_operations:read</b>` - Получение истории операций пользователя<br/>• `<b>messenger:read</b>` - Чтение сообщений в мессенджере Авито<br/>• `<b>messenger:write</b>` - Отправка сообщений в мессенджере Авито<br/>• `<b>autoload:reports</b>` - Получение отчетов Автозагрузки<br/>• `<b>job:applications</b>` - Получение информации об откликах на вакансии<br/>• `<b>job:cv</b>` - Получение информации резюме<br/>• `<b>job:vacancy</b>` - Работа с вакансиями<br/>• `<b>job:write</b>` - Изменение объявлений вертикали Работа<br/>• `<b>short_term_rent:read</b>` - Получение информации об объявлениях краткосрочной аренды<br/>• `<b>short_term_rent:write</b>` - Изменение объявлений краткосрочной аренды<br/>• `<b>ratings:read</b>` - Получение отзывов<br/>• `<b>ratings:write</b>` - Отправка ответа на отзыв<br/>• `<b>cpxpromo:read</b>` - Legacy CPXPromo: получение ставок продвижения<br/>• `<b>cpxpromo:edit</b>` - Legacy CPXPromo: редактирование ставок продвижения<br/><br/><b>Примеры комбинаций (разделитель - ЗАПЯТАЯ):</b><br/>• Базовая работа с объявлениями: `items:info,stats:read`<br/>• User API: `user:read,user_balance:read,user_operations:read`<br/>• Special Offers: `special_offers:sending`<br/>• Promotion v1 + BBIP: `items:info,items:apply_bbip`<br/>• Promotion v1 от имени сотрудника: `items:info,items:apply_bbip,ah:access`<br/>• Legacy CPXPromo: `cpxpromo:read,cpxpromo:edit`<br/>• Полная работа с объявлениями: `items:info,items:apply_vas,stats:read,user:read,user_balance:read,user_operations:read`<br/>• Мессенджер: `messenger:read,messenger:write,user:read`',
			name: 'authCodeNotice',
			type: 'notice',
			displayOptions: {
				show: {
					grantType: ['authorizationCode'],
				},
			},
			default: '',
		},
	];
}
