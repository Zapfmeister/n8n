import {
	ICredentialDataDecryptedObject,
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	IWebhookFunctions,
	JsonObject,
	NodeApiError
} from 'n8n-workflow';

import {
	OptionsWithUri,
} from 'request';

import moment from 'moment-timezone';

export async function onfleetApiRequest(
	this: IWebhookFunctions | IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: string,
	resource: string,
	body: any = {}, // tslint:disable-line:no-any
	qs?: any, // tslint:disable-line:no-any
	uri?: string): Promise<any> { // tslint:disable-line:no-any

	const credentials = await this.getCredentials('onfleetApi') as ICredentialDataDecryptedObject;

	const options: OptionsWithUri = {
		headers: {
			'Content-Type': 'application/json',
			'User-Agent': 'n8n-onfleet',
		},
		auth: {
			user: credentials.apiKey as string,
			pass: '',
		},
		method,
		body,
		qs,
		uri: uri || `https://onfleet.com/api/v2/${resource}`,
		json: true,
	};
	try {
		//@ts-ignore
		return await this.helpers.request(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function onfleetApiRequestAllItems(
	this: IWebhookFunctions | IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	propertyName: string,
	method: string,
	endpoint: string,
	// tslint:disable-next-line: no-any
	body: any = {},
	query: IDataObject = {},
): Promise<any> { // tslint:disable-line:no-any

	const returnData: IDataObject[] = [];

	let responseData;

	do {
		responseData = await onfleetApiRequest.call(this, method, endpoint, body, query);
		query.lastId = responseData['lastId'];
		returnData.push.apply(returnData, responseData[propertyName]);
	} while (
		responseData['lastId'] !== undefined
	);

	return returnData;
}
export const resourceLoaders = {
	async getTeams(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		try {
			const teams = await onfleetApiRequest.call(this, 'GET', 'teams') as IDataObject[];
			return teams.map(({ name = '', id: value = '' }) => ({ name, value })) as INodePropertyOptions[];
		} catch (error) {
			return [];
		}
	},

	async getWorkers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		try {
			const workers = await onfleetApiRequest.call(this, 'GET', 'workers') as IDataObject[];
			return workers.map(({ name = '', id: value = '' }) => ({ name, value })) as INodePropertyOptions[];
		} catch (error) {
			return [];
		}
	},

	async getAdmins(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		try {
			const admins = await onfleetApiRequest.call(this, 'GET', 'admins') as IDataObject[];
			return admins.map(({ name = '', id: value = '' }) => ({ name, value })) as INodePropertyOptions[];
		} catch (error) {
			return [];
		}
	},

	async getHubs(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		try {
			const hubs = await onfleetApiRequest.call(this, 'GET', 'hubs') as IDataObject[];
			return hubs.map(({ name = '', id: value = '' }) => ({ name, value })) as INodePropertyOptions[];
		} catch (error) {
			return [];
		}
	},

	async getTimezones(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const returnData = [] as INodePropertyOptions[];
		for (const timezone of moment.tz.names()) {
			returnData.push({
				name: timezone,
				value: timezone,
			});
		}
		return returnData;
	},
};
