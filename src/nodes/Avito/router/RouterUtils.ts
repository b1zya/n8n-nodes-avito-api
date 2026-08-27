import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

// Импорт операций с объявлениями
import { accountSpendings } from '../Ads/accountSpendings';
import { analytics } from '../Ads/analytics';
import { applyVas } from '../Ads/applyVas';
import { callsStats } from '../Ads/callsStats';
import { getItemInfo } from '../Ads/getItemInfo';
import { getItems } from '../Ads/getItems';
import { getVasPrices } from '../Ads/getVasPrices';
import { statsShallow } from '../Ads/statsShallow';
import { updatePrice } from '../Ads/updatePrice';

// Импорт операций пользователя
import { getUserBalance } from '../User/getUserBalance';
import { getUserInfoSelf } from '../User/getUserInfoSelf';
import { postOperationsHistory } from '../User/postOperationsHistory';

// Импорт операций иерархии аккаунтов
import { checkAhUser } from '../AccountHierarchy/checkAhUser';
import { getAhInfo } from '../AccountHierarchy/getAhInfo';
import { getEmployees } from '../AccountHierarchy/getEmployees';
import { linkItems } from '../AccountHierarchy/linkItems';
import { listCompanyPhones } from '../AccountHierarchy/listCompanyPhones';
import { listItemsByEmployee } from '../AccountHierarchy/listItemsByEmployee';

// Импорт операций продвижения
import { createBbipOrder } from '../Promotion/createBbipOrder';
import { getBbipForecasts } from '../Promotion/getBbipForecasts';
import { getBbipSuggests } from '../Promotion/getBbipSuggests';
import { getOrderStatus } from '../Promotion/getOrderStatus';
import { getServicesByItems } from '../Promotion/getServicesByItems';
import { getServicesDict } from '../Promotion/getServicesDict';
import { listOrders } from '../Promotion/listOrders';

// Импорт legacy CPXPromo операций
import { getBids } from '../CpxPromoLegacy/getBids';
import { getPromotionsByItemIds } from '../CpxPromoLegacy/getPromotionsByItemIds';
import { remove } from '../CpxPromoLegacy/removePromotion';
import { setAuto } from '../CpxPromoLegacy/setAuto';
import { setManual } from '../CpxPromoLegacy/setManual';

// Импорт операций с рейтингами и отзывами
import { getRatingInfo } from '../Ratings/getRatingInfo';
import { getReviews } from '../Ratings/getReviews';
import { createAnswer } from '../Ratings/createAnswer';
import { removeAnswer } from '../Ratings/removeAnswer';

// Импорт операций автозагрузки
import { getCategoryTree } from '../Autoload/getCategoryTree';
import { getCategoryFields } from '../Autoload/getCategoryFields';
import { getProfile } from '../Autoload/getProfile';
import { createOrUpdateProfile } from '../Autoload/createOrUpdateProfile';
import { getReports } from '../Autoload/getReports';
import { getLastReport } from '../Autoload/getLastReport';
import { getReportById } from '../Autoload/getReportById';
import { getReportItems } from '../Autoload/getReportItems';
import { getReportItemsFees } from '../Autoload/getReportItemsFees';
import { uploadFile } from '../Autoload/uploadFile';
import { getAutoloadItemsInfoV2 } from '../Autoload/getAutoloadItemsInfoV2';
import { getAdIdsByAvitoIds } from '../Autoload/getAdIdsByAvitoIds';
import { getUploads } from '../Autoload/getUploads';
import { getUpload } from '../Autoload/getUpload';
import { getUploadItems } from '../Autoload/getUploadItems';
import { getAvitoIdsByAdIds } from '../Autoload/getAvitoIdsByAdIds';

// Импорт операций тарифов
import { getTariffInfo } from '../Tariff/getTariffInfo';

// Импорт операций рассылки скидок и спецпредложений
import { openApiAvailable } from '../SpecialOffers/openApiAvailable';
import { openApiMultiConfirm } from '../SpecialOffers/openApiMultiConfirm';
import { openApiMultiCreate } from '../SpecialOffers/openApiMultiCreate';
import { openApiStats } from '../SpecialOffers/openApiStats';
import { openApiTariffInfo } from '../SpecialOffers/openApiTariffInfo';

// Импорт операций CPA
import { getBalance } from '../Cpa/getBalance';
import { getCallsByTime } from '../Cpa/getCallsByTime';
import { getChatByActionId } from '../Cpa/getChatByActionId';
import { getChatsByTime } from '../Cpa/getChatsByTime';
import { createCallComplaint } from '../Cpa/createCallComplaint';
import { createActionComplaint } from '../Cpa/createActionComplaint';
import { getPhonesInfoFromChats } from '../Cpa/getPhonesInfoFromChats';

// Импорт операций CallTracking
import { getCallById } from '../CallTracking/getCallById';
import { getCalls } from '../CallTracking/getCalls';
import { getRecordByCallId } from '../CallTracking/getRecordByCallId';

// Импорт операций Messenger
import { addToBlacklist } from '../Messenger/addToBlacklist';
import { deleteMessage } from '../Messenger/deleteMessage';
import { getChatById } from '../Messenger/getChatById';
import { getChats } from '../Messenger/getChats';
import { getMessages } from '../Messenger/getMessages';
import { getSubscriptions } from '../Messenger/getSubscriptions';
import { getVoiceFiles } from '../Messenger/getVoiceFiles';
import { readChat } from '../Messenger/readChat';
import { sendImageMessage } from '../Messenger/sendImageMessage';
import { sendMessage } from '../Messenger/sendMessage';
import { subscribeWebhook } from '../Messenger/subscribeWebhook';
import { unsubscribeWebhook } from '../Messenger/unsubscribeWebhook';
import { uploadImages } from '../Messenger/uploadImages';

export async function routeItemOperation(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'getItems':
			return await getItems.call(this, itemIndex);
		case 'getItemInfo':
			return await getItemInfo.call(this, itemIndex);
		case 'updatePrice':
			return await updatePrice.call(this, itemIndex);
		case 'applyVas':
			return await applyVas.call(this, itemIndex);
		case 'getVasPrices':
			return await getVasPrices.call(this, itemIndex);
		case 'callsStats':
			return await callsStats.call(this, itemIndex);
		case 'statsShallow':
			return await statsShallow.call(this, itemIndex);
		case 'analytics':
			return await analytics.call(this, itemIndex);
		case 'accountSpendings':
			return await accountSpendings.call(this, itemIndex);
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unknown item operation: ${operation}`,
				{ itemIndex },
			);
	}
}

export async function routePromotionOperation(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'createBbipOrder':
			return await createBbipOrder.call(this, itemIndex);
		case 'getBbipForecasts':
			return await getBbipForecasts.call(this, itemIndex);
		case 'getBbipSuggests':
			return await getBbipSuggests.call(this, itemIndex);
		case 'getOrderStatus':
			return await getOrderStatus.call(this, itemIndex);
		case 'getServicesByItems':
			return await getServicesByItems.call(this, itemIndex);
		case 'getServicesDict':
			return await getServicesDict.call(this, itemIndex);
		case 'listOrders':
			return await listOrders.call(this, itemIndex);
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unknown promotion operation: ${operation}`,
				{ itemIndex },
			);
	}
}

export async function routeUserOperation(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'getUserBalance':
			return await getUserBalance.call(this, itemIndex);
		case 'getUserInfoSelf':
			return await getUserInfoSelf.call(this, itemIndex);
		case 'postOperationsHistory':
			return await postOperationsHistory.call(this, itemIndex);
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unknown user operation: ${operation}`,
				{ itemIndex },
			);
	}
}

/**
 * Роутер для операций иерархии аккаунтов
 */
export async function routeAccountHierarchyOperation(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'checkAhUser':
			return await checkAhUser.call(this, itemIndex);
		case 'getAhInfo':
			return await getAhInfo.call(this, itemIndex);
		case 'getEmployees':
			return await getEmployees.call(this, itemIndex);
		case 'linkItems':
			return await linkItems.call(this, itemIndex);
		case 'listCompanyPhones':
			return await listCompanyPhones.call(this, itemIndex);
		case 'listItemsByEmployee':
			return await listItemsByEmployee.call(this, itemIndex);
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unknown account hierarchy operation: ${operation}`,
				{ itemIndex },
			);
	}
}

export async function routeCpxPromoLegacyOperation(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'getBids':
			return await getBids.call(this, itemIndex);
		case 'getPromotionsByItemIds':
			return await getPromotionsByItemIds.call(this, itemIndex);
		case 'setManual':
			return await setManual.call(this, itemIndex);
		case 'setAuto':
			return await setAuto.call(this, itemIndex);
		case 'remove':
			return await remove.call(this, itemIndex);
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unknown CPXPromo legacy operation: ${operation}`,
				{ itemIndex },
			);
	}
}

/**
 * Роутер для операций с рейтингами и отзывами
 */
export async function routeRatingsOperation(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'getRatingInfo':
			return await getRatingInfo.call(this, itemIndex);
		case 'getReviews':
			return await getReviews.call(this, itemIndex);
		case 'createAnswer':
			return await createAnswer.call(this, itemIndex);
		case 'removeAnswer':
			return await removeAnswer.call(this, itemIndex);
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unknown ratings operation: ${operation}`,
				{ itemIndex },
			);
	}
}

/**
 * Роутер для операций автозагрузки
 */
export async function routeAutoloadOperation(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'getCategoryTree':
			return await getCategoryTree.call(this, itemIndex);
		case 'getProfile':
			return await getProfile.call(this, itemIndex);
		case 'createOrUpdateProfile':
			return await createOrUpdateProfile.call(this, itemIndex);
		case 'getReports':
			return await getReports.call(this, itemIndex);
		case 'getLastReport':
			return await getLastReport.call(this, itemIndex);
		case 'getReportById':
			return await getReportById.call(this, itemIndex);
		case 'getReportItems':
			return await getReportItems.call(this, itemIndex);
		case 'getReportItemsFees':
			return await getReportItemsFees.call(this, itemIndex);
		case 'uploadFile':
			return await uploadFile.call(this, itemIndex);
		case 'getCategoryFields':
			return await getCategoryFields.call(this, itemIndex);
		case 'getAutoloadItemsInfoV2':
			return await getAutoloadItemsInfoV2.call(this, itemIndex);
		case 'getUploads':
			return await getUploads.call(this, itemIndex);
		case 'getUpload':
			return await getUpload.call(this, itemIndex);
		case 'getUploadItems':
			return await getUploadItems.call(this, itemIndex);
		case 'getAdIdsByAvitoIds':
			return await getAdIdsByAvitoIds.call(this, itemIndex);
		case 'getAvitoIdsByAdIds':
			return await getAvitoIdsByAdIds.call(this, itemIndex);
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unknown autoload operation: ${operation}`,
				{ itemIndex },
			);
	}
}

export async function routeTariffOperation(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'getTariffInfo':
			return await getTariffInfo.call(this, itemIndex);
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unknown tariff operation: ${operation}`,
				{ itemIndex },
			);
	}
}

export async function routeSpecialOffersOperation(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'openApiAvailable':
			return await openApiAvailable.call(this, itemIndex);
		case 'openApiMultiConfirm':
			return await openApiMultiConfirm.call(this, itemIndex);
		case 'openApiMultiCreate':
			return await openApiMultiCreate.call(this, itemIndex);
		case 'openApiStats':
			return await openApiStats.call(this, itemIndex);
		case 'openApiTariffInfo':
			return await openApiTariffInfo.call(this, itemIndex);
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unknown special offers operation: ${operation}`,
				{ itemIndex },
			);
	}
}

/**
 * Роутер для операций CPA
 */
export async function routeCpaOperation(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'getBalance':
			return await getBalance.call(this, itemIndex);
		case 'getCallsByTime':
			return await getCallsByTime.call(this, itemIndex);
		case 'getChatByActionId':
			return await getChatByActionId.call(this, itemIndex);
		case 'getChatsByTime':
			return await getChatsByTime.call(this, itemIndex);
		case 'createCallComplaint':
			return await createCallComplaint.call(this, itemIndex);
		case 'createActionComplaint':
			return await createActionComplaint.call(this, itemIndex);
		case 'getPhonesInfoFromChats':
			return await getPhonesInfoFromChats.call(this, itemIndex);
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unknown CPA operation: ${operation}`,
				{ itemIndex },
			);
	}
}

/**
 * Роутер для операций CallTracking
 */
export async function routeCallTrackingOperation(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[] | INodeExecutionData> {
	switch (operation) {
		case 'getCallById':
			return await getCallById.call(this, itemIndex);
		case 'getCalls':
			return await getCalls.call(this, itemIndex);
		case 'getRecordByCallId':
			return await getRecordByCallId.call(this, itemIndex);
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unknown CallTracking operation: ${operation}`,
				{ itemIndex },
			);
	}
}

/**
 * Роутер для операций Messenger
 */
export async function routeMessengerOperation(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'addToBlacklist':
			return await addToBlacklist.call(this, itemIndex);
		case 'deleteMessage':
			return await deleteMessage.call(this, itemIndex);
		case 'getChatById':
			return await getChatById.call(this, itemIndex);
		case 'getChats':
			return await getChats.call(this, itemIndex);
		case 'getMessages':
			return await getMessages.call(this, itemIndex);
		case 'getSubscriptions':
			return await getSubscriptions.call(this, itemIndex);
		case 'getVoiceFiles':
			return await getVoiceFiles.call(this, itemIndex);
		case 'readChat':
			return await readChat.call(this, itemIndex);
		case 'sendImageMessage':
			return await sendImageMessage.call(this, itemIndex);
		case 'sendMessage':
			return await sendMessage.call(this, itemIndex);
		case 'subscribeWebhook':
			return await subscribeWebhook.call(this, itemIndex);
		case 'unsubscribeWebhook':
			return await unsubscribeWebhook.call(this, itemIndex);
		case 'uploadImages':
			return await uploadImages.call(this, itemIndex);
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unknown Messenger operation: ${operation}`,
				{ itemIndex },
			);
	}
}
