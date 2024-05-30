import {
	ECSClient,
	ListClustersCommand,
	DescribeClustersCommand,
	ListServicesCommand,
	DescribeServicesCommand,
	ListTasksCommand,
	DescribeTasksCommand,
	Cluster,
	Service,
	Task,
} from '@aws-sdk/client-ecs'
import {Credentials, Resources} from '@/types'
import {RateLimiter} from '@/scanners/common/RateLimiter'

async function getECSClusters(client: ECSClient, rateLimiter: RateLimiter): Promise<Cluster[]> {
	const listClustersCommand = new ListClustersCommand({})
	const listClustersResponse = await rateLimiter.throttle(() => client.send(listClustersCommand))

	const describeClustersCommand = new DescribeClustersCommand({
		clusters: listClustersResponse.clusterArns,
	})
	const describeClustersResponse = await rateLimiter.throttle(() => client.send(describeClustersCommand))

	return describeClustersResponse.clusters as Cluster[]
}

async function getECSServices(client: ECSClient, rateLimiter: RateLimiter, clusterArn: string): Promise<Service[]> {
	const listServicesCommand = new ListServicesCommand({cluster: clusterArn})
	const listServicesResponse = await rateLimiter.throttle(() => client.send(listServicesCommand))

	if (listServicesResponse.serviceArns && listServicesResponse.serviceArns.length > 0) {
		const describeServicesCommand = new DescribeServicesCommand({
			cluster: clusterArn,
			services: listServicesResponse.serviceArns,
		})
		const describeServicesResponse = await rateLimiter.throttle(() => client.send(describeServicesCommand))
		return describeServicesResponse.services as Service[]
	} else {
		return []
	}
}

async function getECSTasks(client: ECSClient, rateLimiter: RateLimiter, clusterArn: string): Promise<Task[]> {
	const listTasksCommand = new ListTasksCommand({cluster: clusterArn})
	const listTasksResponse = await rateLimiter.throttle(() => client.send(listTasksCommand))

	if (listTasksResponse.taskArns && listTasksResponse.taskArns.length > 0) {
		const describeTasksCommand = new DescribeTasksCommand({
			cluster: clusterArn,
			tasks: listTasksResponse.taskArns,
		})
		const describeTasksResponse = await rateLimiter.throttle(() => client.send(describeTasksCommand))
		return describeTasksResponse.tasks as Task[]
	} else {
		return []
	}
}

export async function getECSResources(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<Cluster | Service | Task>> {
	const client = new ECSClient([{credentials, region}])

	const clusters = await getECSClusters(client, rateLimiter)

	const resources: Resources<Cluster | Service | Task> = {}

	for (const cluster of clusters) {
		if (!cluster.clusterArn) throw new Error('Cluster ARN is missing in the response')
		resources[cluster.clusterArn] = cluster

		const services = await getECSServices(client, rateLimiter, cluster.clusterArn)
		for (const service of services) {
			if (!service.serviceArn) throw new Error('Service ARN is missing in the response')
			resources[service.serviceArn] = service
		}

		const tasks = await getECSTasks(client, rateLimiter, cluster.clusterArn)
		for (const task of tasks) {
			if (!task.taskArn) throw new Error('Task ARN is missing in the response')
			resources[task.taskArn] = task
		}
	}

	return resources
}
