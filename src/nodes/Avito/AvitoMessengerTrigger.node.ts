import type {
	IDataObject,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	JsonObject,
} from 'n8n-workflow';

import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

async function avitoHookRequest<T extends IDataObject = IDataObject>(
	context: IHookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
): Promise<T> {
	const options: IHttpRequestOptions = {
		method,
		url: `https://api.avito.ru${endpoint}`,
		headers: {
			'Content-Type': 'application/json',
		},
		json: true,
		...(body && { body }),
	};

	try {
		return await context.helpers.httpRequestWithAuthentication.call(
			context,
			'avitoOAuth2Api',
			options,
			{
				oauth2: {
					includeCredentialsOnRefreshOnBody: true,
					tokenType: 'Bearer',
					keepBearer: true,
				},
			},
		) as T;
	} catch (error: unknown) {
		throw new NodeApiError(context.getNode(), error as JsonObject);
	}
}

function getWebhookUrl(context: IHookFunctions): string {
	const webhookUrl = context.getNodeWebhookUrl('default');

	if (!webhookUrl) {
		throw new NodeOperationError(context.getNode(), 'Webhook URL is not available');
	}

	return webhookUrl;
}

export class AvitoMessengerTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Avito Messenger Trigger',
		name: 'avitoTrigger',
		icon: { light: 'file:../../../icons/avito.svg', dark: 'file:../../../icons/avito.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{"Webhook V3"}}',
		description: 'Starts the workflow when Avito Messenger webhook events occur',
		codex: {
			alias: [
				'Авито',
				'Авито Мессенджер',
				'Авито Вебхук',
				'Avito Messenger Trigger',
				'Avito Messenger Webhook',
				'Messenger Webhook',
			],
		},
		eventTriggerDescription: 'Waiting for an Avito Messenger webhook event',
		activationMessage: 'Avito Messenger webhook subscription is active.',
		defaults: { name: 'Avito Messenger Trigger' },
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		triggerPanel: {
			header: 'Avito Messenger Webhook V3',
			executionsHelp: {
				inactive:
					'While building your workflow, execute this trigger and send a test Avito Messenger webhook event to the test URL. For production, activate the workflow so Avito can send events to the production URL.',
				active:
					'This workflow is active. Avito Messenger events sent to the production webhook URL will start workflow executions.',
			},
			activationHint:
				'When automatic subscription management is enabled, n8n registers the production webhook URL in Avito on activation and unsubscribes it on deactivation.',
		},
		credentials: [
			{
				name: 'avitoOAuth2Api',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'avito-messenger',
			},
		],
		properties: [
			{
				displayName: 'Автоматически Управлять Подпиской',
				name: 'autoRegister',
				type: 'boolean',
				default: true,
				description: 'Whether to subscribe/unsubscribe the production webhook URL in Avito when the workflow is activated/deactivated',
			},
			{
				displayName: '<b>Avito Messenger Webhook V3</b><br><br>При активации workflow node регистрирует production URL через <code>POST /messenger/v3/webhook</code>, а при деактивации отключает его через <code>POST /messenger/v1/webhook/unsubscribe</code>.<br><br>По документации Avito URL должен быть публично доступен и отвечать HTTP 200 за 2 секунды.',
				name: 'webhookNotice',
				type: 'notice',
				default: '',
			},
		],
		usableAsTool: undefined,
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const autoRegister = this.getNodeParameter('autoRegister', true) as boolean;

				if (!autoRegister) {
					return true;
				}

				const webhookUrl = getWebhookUrl(this);
				const response = await avitoHookRequest(
					this,
					'POST',
					'/messenger/v1/subscriptions',
				);
				const subscriptions = response.subscriptions as Array<{ url?: string; version?: string }> | undefined;

				return subscriptions?.some((subscription) => subscription.url === webhookUrl && subscription.version === '3') ?? false;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const autoRegister = this.getNodeParameter('autoRegister', true) as boolean;

				if (!autoRegister) {
					return true;
				}

				await avitoHookRequest(
					this,
					'POST',
					'/messenger/v3/webhook',
					{ url: getWebhookUrl(this) },
				);

				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				const autoRegister = this.getNodeParameter('autoRegister', true) as boolean;

				if (!autoRegister) {
					return true;
				}

				await avitoHookRequest(
					this,
					'POST',
					'/messenger/v1/webhook/unsubscribe',
					{ url: getWebhookUrl(this) },
				);

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData();
		const headers = this.getHeaderData();
		const query = this.getQueryData();
		const params = this.getParamsData();
		const receivedAt = new Date().toISOString();

		const workflowItem: INodeExecutionData = {
			json: {
				body,
				headers,
				query,
				params,
				receivedAt,
			},
		};

		return {
			webhookResponse: {
				ok: true,
			},
			workflowData: [[workflowItem]],
		};
	}
}
