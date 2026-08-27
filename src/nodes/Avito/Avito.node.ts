import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';

import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { getErrorMessage } from './types/AvitoTypes';

// Импортируем роутеры для всех ресурсов
import {
	routeItemOperation,
	routePromotionOperation,
	routeRatingsOperation,
	routeAutoloadOperation,
	routeCpaOperation,
	routeCpxPromoLegacyOperation,
	routeCallTrackingOperation,
	routeMessengerOperation,
	routeUserOperation,
	routeTariffOperation,
	routeSpecialOffersOperation,
	routeAccountHierarchyOperation,
} from './router/RouterUtils';

// Импортируем описания для всех ресурсов
import { baseProperties } from './Descriptions/BaseProperties';
import { itemOperations, itemFields } from './Descriptions/ItemDescription';
import { userOperations, userFields } from './Descriptions/UserDescription';
import {
	accountHierarchyOperations,
	accountHierarchyFields,
} from './Descriptions/AccountHierarchyDescription';
import { promotionOperations, promotionFields } from './Descriptions/PromotionDescription';
import { cpxPromoLegacyOperations, cpxPromoLegacyFields } from './Descriptions/CpxPromoLegacyDescription';
import { ratingsOperations, ratingsFields } from './Descriptions/RatingsDescription';
import { autoloadOperations, autoloadFields } from './Descriptions/AutoloadDescription';
import { tariffOperations, tariffFields } from './Descriptions/TariffDescription';
import { specialOffersOperations, specialOffersFields } from './Descriptions/SpecialOffersDescription';
import { cpaOperations, cpaFields } from './Descriptions/CpaDescription';
import { callTrackingOperations, callTrackingFields } from './Descriptions/CallTrackingDescription';
import { messengerOperations, messengerFields } from './Descriptions/MessengerDescription';

export class Avito implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Avito',
		name: 'avito',
		icon: { light: 'file:../../../icons/avito.svg', dark: 'file:../../../icons/avito.dark.svg' },
		group: ['transform'],
		version: [1],
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Взаимодействие с API Авито для бизнеса',
		codex: {
			alias: ['Авито', 'Авито API', 'Авито для бизнеса'],
		},
		defaults: { name: 'Avito' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'avitoOAuth2Api',
				required: true,
			},
		],
		properties: [
			...baseProperties,
			...itemOperations,
			...userOperations,
			...accountHierarchyOperations,
			...promotionOperations,
			...cpxPromoLegacyOperations,
			...ratingsOperations,
			...autoloadOperations,
			...tariffOperations,
			...specialOffersOperations,
			...cpaOperations,
			...callTrackingOperations,
			...messengerOperations,
			...itemFields,
			...userFields,
			...accountHierarchyFields,
			...promotionFields,
			...cpxPromoLegacyFields,
			...ratingsFields,
			...autoloadFields,
			...tariffFields,
			...specialOffersFields,
			...cpaFields,
			...callTrackingFields,
			...messengerFields,
		],
		usableAsTool: true,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[] | INodeExecutionData;

				// Роутинг по ресурсам
				if (resource === 'item') {
					responseData = await routeItemOperation.call(this, operation, i);
				} else if (resource === 'user') {
					responseData = await routeUserOperation.call(this, operation, i);
				} else if (resource === 'accountHierarchy') {
					responseData = await routeAccountHierarchyOperation.call(this, operation, i);
				} else if (resource === 'promotion') {
					responseData = await routePromotionOperation.call(this, operation, i);
				} else if (resource === 'cpxPromoLegacy') {
					responseData = await routeCpxPromoLegacyOperation.call(this, operation, i);
				} else if (resource === 'ratings') {
					responseData = await routeRatingsOperation.call(this, operation, i);
				} else if (resource === 'autoload') {
					responseData = await routeAutoloadOperation.call(this, operation, i);
				} else if (resource === 'tariff') {
					responseData = await routeTariffOperation.call(this, operation, i);
				} else if (resource === 'specialOffers') {
					responseData = await routeSpecialOffersOperation.call(this, operation, i);
				} else if (resource === 'cpa') {
					responseData = await routeCpaOperation.call(this, operation, i);
				} else if (resource === 'callTracking') {
					responseData = await routeCallTrackingOperation.call(this, operation, i);
				} else if (resource === 'messenger') {
					responseData = await routeMessengerOperation.call(this, operation, i);
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`, {
						itemIndex: i,
					});
				}

				if (responseData && typeof responseData === 'object' && 'json' in responseData) {
					const executionData = responseData as INodeExecutionData;
					returnData.push.apply(
						returnData,
						this.helpers.constructExecutionMetaData([executionData], { itemData: { item: i } }),
					);
				} else {
					returnData.push.apply(
						returnData,
						this.helpers.constructExecutionMetaData(
							this.helpers.returnJsonArray(responseData as IDataObject | IDataObject[]),
							{ itemData: { item: i } },
						),
					);
				}
			} catch (error: unknown) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: getErrorMessage(error) }, pairedItem: { item: i } });
					continue;
				}
				if (error instanceof NodeApiError) {
					throw new NodeApiError(this.getNode(), error as unknown as JsonObject, { itemIndex: i });
				}
				if (error instanceof NodeOperationError) {
					throw new NodeOperationError(this.getNode(), error.message, { itemIndex: i });
				}
				throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
			}
		}
		return [returnData];
	}
}
