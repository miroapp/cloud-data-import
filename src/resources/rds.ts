import {
    RDSClient,
    DescribeDBInstancesCommand,
    DBInstance,
    DescribeDBClustersCommand,
    DBCluster,
  } from "@aws-sdk/client-rds";
  import { Credentials, Resources } from "../types";
import { RateLimiter } from "../utils/RateLimiter";
  
  async function getRDSInstances(client: RDSClient, rateLimiter: RateLimiter): Promise<DBInstance[]> {
    const dbInstances: DBInstance[] = [];
  
    let marker: string | undefined;
    do {
      const describeDBInstancesCommand = new DescribeDBInstancesCommand({
        MaxRecords: 100,
        Marker: marker,
      });
  
      const describeDBInstancesResponse = await rateLimiter.throttle(() => client.send(describeDBInstancesCommand));
  
      if (describeDBInstancesResponse.DBInstances) {
        dbInstances.push(...describeDBInstancesResponse.DBInstances);
      }
  
      marker = describeDBInstancesResponse.Marker;
    } while (marker);
  
    return dbInstances;
  }
  
  async function getRDSClusters(client: RDSClient, rateLimiter: RateLimiter): Promise<DBCluster[]> {
    const dbClusters: DBCluster[] = [];
  
    let marker: string | undefined;
    do {
      const describeDBClustersCommand = new DescribeDBClustersCommand({
        MaxRecords: 100,
        Marker: marker,
      });
  
      const describeDBClustersResponse = await rateLimiter.throttle(() => client.send(describeDBClustersCommand));
  
      if (describeDBClustersResponse.DBClusters) {
        dbClusters.push(...describeDBClustersResponse.DBClusters);
      }
  
      marker = describeDBClustersResponse.Marker;
    } while (marker);
  
    return dbClusters;
  }
  
  export async function getRDSResources(credentials: Credentials, rateLimiter: RateLimiter, region: string): Promise<Resources<DBInstance | DBCluster>> {
    const client = new RDSClient({ region });

    const [instances, clusters] = await Promise.all([
      getRDSInstances(client, rateLimiter),
      getRDSClusters(client, rateLimiter),
    ]);
    
    const instanceResources = instances.reduce((acc, instance) => {
      if (!instance.DBInstanceArn) {
        throw new Error('DBInstanceArn is missing in the response');
      }
  
      acc[instance.DBInstanceArn] = instance;
      return acc;
    }, {} as Resources<DBInstance>);

    const clusterResources = clusters.reduce((acc, cluster) => {
      if (!cluster.DBClusterArn) {
        throw new Error('DBClusterArn is missing in the response');
      }
  
      acc[cluster.DBClusterArn] = cluster;
      return acc;
    }, {} as Resources<DBCluster>);

    return { ...instanceResources, ...clusterResources };
  }
  