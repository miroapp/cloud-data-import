import {
    RDSClient,
    DescribeDBInstancesCommand,
    DBInstance,
    DescribeDBClustersCommand,
    DBCluster,
  } from "@aws-sdk/client-rds";
  import { RDSSchema } from "../types";
  
  async function getRDSInstances(region: string): Promise<DBInstance[]> {
    const client = new RDSClient({ region });
    const dbInstances: DBInstance[] = [];
  
    let marker: string | undefined;
    do {
      const describeDBInstancesCommand = new DescribeDBInstancesCommand({
        MaxRecords: 100,
        Marker: marker,
      });
  
      const describeDBInstancesResponse = await client.send(describeDBInstancesCommand);
  
      if (describeDBInstancesResponse.DBInstances) {
        dbInstances.push(...describeDBInstancesResponse.DBInstances);
      }
  
      marker = describeDBInstancesResponse.Marker;
    } while (marker);
  
    return dbInstances;
  }
  
  async function getRDSClusters(region: string): Promise<DBCluster[]> {
    const client = new RDSClient({ region });
    const dbClusters: DBCluster[] = [];
  
    let marker: string | undefined;
    do {
      const describeDBClustersCommand = new DescribeDBClustersCommand({
        MaxRecords: 100,
        Marker: marker,
      });
  
      const describeDBClustersResponse = await client.send(describeDBClustersCommand);
  
      if (describeDBClustersResponse.DBClusters) {
        dbClusters.push(...describeDBClustersResponse.DBClusters);
      }
  
      marker = describeDBClustersResponse.Marker;
    } while (marker);
  
    return dbClusters;
  }
  
  export async function getRDSResources(region: string): Promise<RDSSchema> {
    const [instances, clusters] = await Promise.all([
      getRDSInstances(region),
      getRDSClusters(region),
    ]);
  
    return {
      instances,
      clusters,
    };
  }
  