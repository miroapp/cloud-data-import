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
    Task
} from "@aws-sdk/client-ecs";
import { Resources } from "../types";
  
async function getECSClusters(client: ECSClient): Promise<Cluster[]> {
    const listClustersCommand = new ListClustersCommand({});
    const listClustersResponse = await client.send(listClustersCommand);
  
    const describeClustersCommand = new DescribeClustersCommand({
      clusters: listClustersResponse.clusterArns,
    });
    const describeClustersResponse = await client.send(describeClustersCommand);
  
    return describeClustersResponse.clusters as Cluster[];
}
  
async function getECSServices(client: ECSClient, clusterArn: string): Promise<Service[]> {
    const listServicesCommand = new ListServicesCommand({ cluster: clusterArn });
    const listServicesResponse = await client.send(listServicesCommand);
  
    if (listServicesResponse.serviceArns && listServicesResponse.serviceArns.length > 0) {
      const describeServicesCommand = new DescribeServicesCommand({
        cluster: clusterArn,
        services: listServicesResponse.serviceArns,
      });
      const describeServicesResponse = await client.send(describeServicesCommand);
      return describeServicesResponse.services as Service[];
    } else {
      return [];
    }
  }
  
  async function getECSTasks(client: ECSClient, clusterArn: string): Promise<Task[]> {
    const listTasksCommand = new ListTasksCommand({ cluster: clusterArn });
    const listTasksResponse = await client.send(listTasksCommand);
  
    if (listTasksResponse.taskArns && listTasksResponse.taskArns.length > 0) {
      const describeTasksCommand = new DescribeTasksCommand({
        cluster: clusterArn,
        tasks: listTasksResponse.taskArns,
      });
      const describeTasksResponse = await client.send(describeTasksCommand);
      return describeTasksResponse.tasks as Task[];
    } else {
      return [];
    }
  }
  
export async function getECSResources(region: string): Promise<Resources<Cluster | Service | Task>> {
    const client = new ECSClient({ region });
  
    const clusters = await getECSClusters(client);
  
    const resources: Resources<Cluster | Service | Task> = {};
  
    for (const cluster of clusters) {
      if (!cluster.clusterArn) throw new Error('Cluster ARN is missing in the response');
      resources[cluster.clusterArn] = cluster;
  
      const services = await getECSServices(client, cluster.clusterArn);
      for (const service of services) {
        if (!service.serviceArn) throw new Error('Service ARN is missing in the response');
        resources[service.serviceArn] = service;
      }
  
      const tasks = await getECSTasks(client, cluster.clusterArn);
      for (const task of tasks) {
        if (!task.taskArn) throw new Error('Task ARN is missing in the response');
        resources[task.taskArn] = task;
      }
    }
  
    return resources;
}
  