import {ResourceExplorer2Client, ListIndexesCommand, ListViewsCommand} from '@aws-sdk/client-resource-explorer-2'
import {AwsCredentials} from '@/types'
import {awsRegionIds} from '@/definitions/supported-regions'

const memoizedClients = new Map<AwsCredentials, ResourceExplorer2Client>()

export async function getResourceExplorerClient(credentials: AwsCredentials): Promise<ResourceExplorer2Client> {
	if (memoizedClients.has(credentials)) {
		return memoizedClients.get(credentials)!
	}

	const client = await findValidClient(credentials)
	memoizedClients.set(credentials, client)
	return client
}

async function findValidClient(credentials: AwsCredentials): Promise<ResourceExplorer2Client> {
	const clientPromises = awsRegionIds.map((region) => checkRegion(credentials, region))
	const clients = await Promise.all(clientPromises)
	const validClient = clients.find((client) => client !== null)

	if (validClient) {
		return validClient
	}

	throw new Error("Resource Explorer is not enabled or 'all-resources' view not found in any region")
}

async function checkRegion(credentials: AwsCredentials, region: string): Promise<ResourceExplorer2Client | null> {
	const client = new ResourceExplorer2Client({credentials, region})

	try {
		await client.send(new ListIndexesCommand({}))
		const {Views} = await client.send(new ListViewsCommand({}))

		if (Views?.some((view) => view.includes(':view/all-resources'))) {
			return client
		}
	} catch (error) {
		// Failed to find 'all-resources' view in this region
	}

	return null
}
