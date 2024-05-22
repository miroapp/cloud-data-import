import {
    EKSClient,
    ListClustersCommand,
    DescribeClusterCommand,
    Cluster
} from "@aws-sdk/client-eks";
import { Credentials, Resources } from "../types";
import { RateLimiter } from "../utils/RateLimiter";
  
async function getEKSClusters(client: EKSClient, rateLimiter: RateLimiter): Promise<Cluster[]> {
    const listClustersCommand = new ListClustersCommand({});
    const listClustersResponse = await rateLimiter.throttle(() => client.send(listClustersCommand));
  
    const clusters: Cluster[] = [];
  
    for (const clusterName of listClustersResponse.clusters || []) {
      const describeClusterCommand = new DescribeClusterCommand({ name: clusterName });
      const describeClusterResponse = await rateLimiter.throttle(() => client.send(describeClusterCommand));
  
      if (describeClusterResponse.cluster) {
        clusters.push(describeClusterResponse.cluster as Cluster);
      }
    }
  
    return clusters;
}
  
export async function getEKSResources(credentials: Credentials, rateLimiter: RateLimiter, region: string): Promise<Resources<Cluster>> {
    const client = new EKSClient([{ credentials, region }]);

    const clusters = await getEKSClusters(client, rateLimiter);
  
    const resources: Resources<Cluster> = {};
  
    for (const cluster of clusters) {
      if (!cluster.arn) throw new Error('Cluster ARN is missing in the response');
      resources[cluster.arn] = cluster;
    }
  
    return resources;
}
  