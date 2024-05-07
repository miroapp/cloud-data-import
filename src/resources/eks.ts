import {
    EKSClient,
    ListClustersCommand,
    DescribeClusterCommand,
    Cluster
} from "@aws-sdk/client-eks";
import { Resources } from "../types";
  
async function getEKSClusters(client: EKSClient): Promise<Cluster[]> {
    const listClustersCommand = new ListClustersCommand({});
    const listClustersResponse = await client.send(listClustersCommand);
  
    const clusters: Cluster[] = [];
  
    for (const clusterName of listClustersResponse.clusters || []) {
      const describeClusterCommand = new DescribeClusterCommand({ name: clusterName });
      const describeClusterResponse = await client.send(describeClusterCommand);
  
      if (describeClusterResponse.cluster) {
        clusters.push(describeClusterResponse.cluster as Cluster);
      }
    }
  
    return clusters;
}
  
export async function getEKSResources(region: string): Promise<Resources<Cluster>> {
    const client = new EKSClient({ region });
    const clusters = await getEKSClusters(client);
  
    const resources: Resources<Cluster> = {};
  
    for (const cluster of clusters) {
      if (!cluster.arn) throw new Error('Cluster ARN is missing in the response');
      resources[cluster.arn] = cluster;
    }
  
    return resources;
}
  