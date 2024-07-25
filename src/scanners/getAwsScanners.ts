import {Credentials, Scanner, ScannerLifecycleHook} from '@/types'
import {GetRateLimiterFunction} from './types'
import {createRegionalScanner, createGlobalScanner} from '.'

import {getAutoScalingResources} from './scan-functions/aws/autoscaling-groups'
import {getCloudFrontDistributions} from './scan-functions/aws/cloudfront-distributions'
import {getCloudTrailTrails} from './scan-functions/aws/cloudtrail-trails'
import {getDynamoDBTables} from './scan-functions/aws/dynamodb-tables'
import {getECSResources} from './scan-functions/aws/ecs'
import {getEFSFileSystems} from './scan-functions/aws/efs-file-systems'
import {getEKSClusters} from './scan-functions/aws/eks-clusters'
import {getELBv2LoadBalancers} from './scan-functions/aws/elbv2-load-balancers'
import {getELBv1LoadBalancers} from './scan-functions/aws/elbv1-load-balancers'
import {getLambdaFunctions} from './scan-functions/aws/lambda-functions'
import {getS3Buckets} from './scan-functions/aws/s3-buckets'
import {getSNSTopics} from './scan-functions/aws/sns-topics'
import {getEC2Instances} from './scan-functions/aws/ec2-instances'
import {getEC2Vpcs} from './scan-functions/aws/ec2-vpcs'
import {getEC2VpcEndpoints} from './scan-functions/aws/ec2-vpc-endpoints'
import {getEC2Subnets} from './scan-functions/aws/ec2-subnets'
import {getEC2RouteTables} from './scan-functions/aws/ec2-route-tables'
import {getEC2InternetGateways} from './scan-functions/aws/ec2-internet-gateways'
import {getEC2NatGateways} from './scan-functions/aws/ec2-nat-gateways'
import {getEC2NetworkAcls} from './scan-functions/aws/ec2-network-acls'
import {getEC2TransitGateways} from './scan-functions/aws/ec2-transit-gateways'
import {getEC2Volumes} from './scan-functions/aws/ec2-volumes'
import {getRDSInstances} from './scan-functions/aws/rds-instances'
import {getRDSClusters} from './scan-functions/aws/rds-clusters'
import {getRDSProxies} from './scan-functions/aws/rds-proxies'
import {getHostedZones} from './scan-functions/aws/route53-hosted-zones'
import {getRedshiftClusters} from './scan-functions/aws/redshift-clusters'
import {getSQSQueues} from './scan-functions/aws/sqs-queues'
import {getElastiCacheClusters} from './scan-functions/aws/elasticache-clusters'
import {getELBv2TargetGroups} from './scan-functions/aws/elbv2-target-groups'
import {getCloudWatchMetricAlarms} from './scan-functions/aws/cloudwatch-metric-alarms'
import {getCloudWatchMetricStreams} from './scan-functions/aws/cloudwatch-metric-streams'
import {getEC2VpnGateways} from './scan-functions/aws/ec2-vpn-gateways'
import {getEC2NetworkInterfaces} from './scan-functions/aws/ec2-network-interfaces'
import {getAthenaNamedQueries} from './scan-functions/aws/athena-named-queries'

interface GetAwsScannersArguments {
	credentials: Credentials
	getRateLimiter: GetRateLimiterFunction
	hooks: ScannerLifecycleHook[]
	regions: string[]
	shouldIncludeGlobalServices: boolean
}

export const getAwsScanners = ({
	credentials,
	hooks,
	getRateLimiter,
	regions,
	shouldIncludeGlobalServices,
}: GetAwsScannersArguments): Scanner[] => {
	const options = {
		credentials,
		getRateLimiter,
		hooks,
	}

	/**
	 * ❗ Note: Services with same service-name will automatically share the rate limiter. e.g:
	 *   ec2/instances and ec2/volumes
	 *   or, rds/clusters and rds/db-instances
	 */

	// Regional scanners
	const scanners: Scanner[] = [
		createRegionalScanner('athena/named-queries', getAthenaNamedQueries, regions, options),
		createRegionalScanner('autoscaling/groups', getAutoScalingResources, regions, options),
		createRegionalScanner('cloudtrail/trails', getCloudTrailTrails, regions, options),
		createRegionalScanner('cloudwatch/metric-alarms', getCloudWatchMetricAlarms, regions, options),
		createRegionalScanner('cloudwatch/metric-streams', getCloudWatchMetricStreams, regions, options),
		createRegionalScanner('dynamodb/tables', getDynamoDBTables, regions, options),
		createRegionalScanner('ec2/instances', getEC2Instances, regions, options),
		createRegionalScanner('ec2/vpcs', getEC2Vpcs, regions, options),
		createRegionalScanner('ec2/vpc-endpoints', getEC2VpcEndpoints, regions, options),
		createRegionalScanner('ec2/subnets', getEC2Subnets, regions, options),
		createRegionalScanner('ec2/route-tables', getEC2RouteTables, regions, options),
		createRegionalScanner('ec2/internet-gateways', getEC2InternetGateways, regions, options),
		createRegionalScanner('ec2/nat-gateways', getEC2NatGateways, regions, options),
		createRegionalScanner('ec2/transit-gateways', getEC2TransitGateways, regions, options),
		createRegionalScanner('ec2/volumes', getEC2Volumes, regions, options),
		createRegionalScanner('ec2/network-acls', getEC2NetworkAcls, regions, options),
		createRegionalScanner('ec2/vpn-gateways', getEC2VpnGateways, regions, options),
		createRegionalScanner('ec2/network-interfaces', getEC2NetworkInterfaces, regions, options),
		createRegionalScanner('ecs', getECSResources, regions, options),
		createRegionalScanner('efs/file-systems', getEFSFileSystems, regions, options),
		createRegionalScanner('elasticache/clusters', getElastiCacheClusters, regions, options),
		createRegionalScanner('elbv2/load-balancers', getELBv2LoadBalancers, regions, options),
		createRegionalScanner('elbv2/target-groups', getELBv2TargetGroups, regions, options),
		createRegionalScanner('elbv1/load-balancers', getELBv1LoadBalancers, regions, options),
		createRegionalScanner('eks/clusters', getEKSClusters, regions, options),
		createRegionalScanner('lambda/functions', getLambdaFunctions, regions, options),
		createRegionalScanner('redshift/clusters', getRedshiftClusters, regions, options),
		createRegionalScanner('rds/instances', getRDSInstances, regions, options),
		createRegionalScanner('rds/clusters', getRDSClusters, regions, options),
		createRegionalScanner('rds/proxies', getRDSProxies, regions, options),
		createRegionalScanner('route53/hosted-zones', getHostedZones, regions, options),
		createRegionalScanner('s3/buckets', getS3Buckets, regions, options),
		createRegionalScanner('sns/topics', getSNSTopics, regions, options),
		createRegionalScanner('sqs/queues', getSQSQueues, regions, options),
	]

	// Global scanners
	if (shouldIncludeGlobalServices) {
		scanners.push(createGlobalScanner('cloudfront/distributions', getCloudFrontDistributions, options))
	}

	return scanners
}
