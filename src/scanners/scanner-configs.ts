import {AwsSupportedResources} from '@/definitions/supported-services'
import {AwsResourceScannerConfig} from './types'

import {getAutoScalingResources} from './scan-functions/aws/autoscaling-groups'
import {getCloudFrontDistributions} from './scan-functions/aws/cloudfront-distributions'
import {getCloudTrailTrails} from './scan-functions/aws/cloudtrail-trails'
import {getDynamoDBTables} from './scan-functions/aws/dynamodb-tables'
import {getECSClusters} from './scan-functions/aws/ecs-clusters'
import {getECSServices} from './scan-functions/aws/ecs-services'
import {getECSTasks} from './scan-functions/aws/ecs-tasks'
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
import {getOpenSearchDomains} from './scan-functions/aws/opensearch-domains'

export const scannerConfigs: {
	[K in AwsSupportedResources]: AwsResourceScannerConfig<K>
} = {
	[AwsSupportedResources.ATHENA_NAMED_QUERIES]: {
		service: AwsSupportedResources.ATHENA_NAMED_QUERIES,
		handler: getAthenaNamedQueries,
	},
	[AwsSupportedResources.AUTOSCALING_GROUPS]: {
		service: AwsSupportedResources.AUTOSCALING_GROUPS,
		handler: getAutoScalingResources,
	},
	[AwsSupportedResources.CLOUDFRONT_DISTRIBUTIONS]: {
		service: AwsSupportedResources.CLOUDFRONT_DISTRIBUTIONS,
		handler: getCloudFrontDistributions,
		global: true,
	},
	[AwsSupportedResources.CLOUDTRAIL_TRAILS]: {
		service: AwsSupportedResources.CLOUDTRAIL_TRAILS,
		handler: getCloudTrailTrails,
	},
	[AwsSupportedResources.CLOUDWATCH_METRIC_ALARMS]: {
		service: AwsSupportedResources.CLOUDWATCH_METRIC_ALARMS,
		handler: getCloudWatchMetricAlarms,
	},
	[AwsSupportedResources.CLOUDWATCH_METRIC_STREAMS]: {
		service: AwsSupportedResources.CLOUDWATCH_METRIC_STREAMS,
		handler: getCloudWatchMetricStreams,
	},
	[AwsSupportedResources.DYNAMODB_TABLES]: {
		service: AwsSupportedResources.DYNAMODB_TABLES,
		handler: getDynamoDBTables,
	},
	[AwsSupportedResources.EC2_INSTANCES]: {
		service: AwsSupportedResources.EC2_INSTANCES,
		handler: getEC2Instances,
	},
	[AwsSupportedResources.EC2_VPCS]: {
		service: AwsSupportedResources.EC2_VPCS,
		handler: getEC2Vpcs,
	},
	[AwsSupportedResources.EC2_VPC_ENDPOINTS]: {
		service: AwsSupportedResources.EC2_VPC_ENDPOINTS,
		handler: getEC2VpcEndpoints,
	},
	[AwsSupportedResources.EC2_SUBNETS]: {
		service: AwsSupportedResources.EC2_SUBNETS,
		handler: getEC2Subnets,
	},
	[AwsSupportedResources.EC2_ROUTE_TABLES]: {
		service: AwsSupportedResources.EC2_ROUTE_TABLES,
		handler: getEC2RouteTables,
	},
	[AwsSupportedResources.EC2_INTERNET_GATEWAYS]: {
		service: AwsSupportedResources.EC2_INTERNET_GATEWAYS,
		handler: getEC2InternetGateways,
	},
	[AwsSupportedResources.EC2_NAT_GATEWAYS]: {
		service: AwsSupportedResources.EC2_NAT_GATEWAYS,
		handler: getEC2NatGateways,
	},
	[AwsSupportedResources.EC2_NETWORK_ACLS]: {
		service: AwsSupportedResources.EC2_NETWORK_ACLS,
		handler: getEC2NetworkAcls,
	},
	[AwsSupportedResources.EC2_TRANSIT_GATEWAYS]: {
		service: AwsSupportedResources.EC2_TRANSIT_GATEWAYS,
		handler: getEC2TransitGateways,
	},
	[AwsSupportedResources.EC2_VOLUMES]: {
		service: AwsSupportedResources.EC2_VOLUMES,
		handler: getEC2Volumes,
	},
	[AwsSupportedResources.EC2_VPN_GATEWAYS]: {
		service: AwsSupportedResources.EC2_VPN_GATEWAYS,
		handler: getEC2VpnGateways,
	},
	[AwsSupportedResources.EC2_NETWORK_INTERFACES]: {
		service: AwsSupportedResources.EC2_NETWORK_INTERFACES,
		handler: getEC2NetworkInterfaces,
	},
	[AwsSupportedResources.ECS_CLUSTERS]: {
		service: AwsSupportedResources.ECS_CLUSTERS,
		handler: getECSClusters,
	},
	[AwsSupportedResources.ECS_SERVICES]: {
		service: AwsSupportedResources.ECS_SERVICES,
		handler: getECSServices,
	},
	[AwsSupportedResources.ECS_TASKS]: {
		service: AwsSupportedResources.ECS_TASKS,
		handler: getECSTasks,
	},
	[AwsSupportedResources.EFS_FILE_SYSTEMS]: {
		service: AwsSupportedResources.EFS_FILE_SYSTEMS,
		handler: getEFSFileSystems,
	},
	[AwsSupportedResources.EKS_CLUSTERS]: {
		service: AwsSupportedResources.EKS_CLUSTERS,
		handler: getEKSClusters,
	},
	[AwsSupportedResources.ELASTICACHE_CLUSTERS]: {
		service: AwsSupportedResources.ELASTICACHE_CLUSTERS,
		handler: getElastiCacheClusters,
	},
	[AwsSupportedResources.ELBV2_LOAD_BALANCERS]: {
		service: AwsSupportedResources.ELBV2_LOAD_BALANCERS,
		handler: getELBv2LoadBalancers,
	},
	[AwsSupportedResources.ELBV2_TARGET_GROUPS]: {
		service: AwsSupportedResources.ELBV2_TARGET_GROUPS,
		handler: getELBv2TargetGroups,
	},
	[AwsSupportedResources.ELBV1_LOAD_BALANCERS]: {
		service: AwsSupportedResources.ELBV1_LOAD_BALANCERS,
		handler: getELBv1LoadBalancers,
	},
	[AwsSupportedResources.LAMBDA_FUNCTIONS]: {
		service: AwsSupportedResources.LAMBDA_FUNCTIONS,
		handler: getLambdaFunctions,
	},
	[AwsSupportedResources.OPENSEARCH_DOMAINS]: {
		service: AwsSupportedResources.OPENSEARCH_DOMAINS,
		handler: getOpenSearchDomains,
	},
	[AwsSupportedResources.RDS_INSTANCES]: {
		service: AwsSupportedResources.RDS_INSTANCES,
		handler: getRDSInstances,
	},
	[AwsSupportedResources.RDS_CLUSTERS]: {
		service: AwsSupportedResources.RDS_CLUSTERS,
		handler: getRDSClusters,
	},
	[AwsSupportedResources.RDS_PROXIES]: {
		service: AwsSupportedResources.RDS_PROXIES,
		handler: getRDSProxies,
	},
	[AwsSupportedResources.REDSHIFT_CLUSTERS]: {
		service: AwsSupportedResources.REDSHIFT_CLUSTERS,
		handler: getRedshiftClusters,
	},
	[AwsSupportedResources.ROUTE53_HOSTED_ZONES]: {
		service: AwsSupportedResources.ROUTE53_HOSTED_ZONES,
		handler: getHostedZones,
		global: true,
	},
	[AwsSupportedResources.S3_BUCKETS]: {
		service: AwsSupportedResources.S3_BUCKETS,
		handler: getS3Buckets,
		global: true,
	},
	[AwsSupportedResources.SNS_TOPICS]: {
		service: AwsSupportedResources.SNS_TOPICS,
		handler: getSNSTopics,
	},
	[AwsSupportedResources.SQS_QUEUES]: {
		service: AwsSupportedResources.SQS_QUEUES,
		handler: getSQSQueues,
	},
}
