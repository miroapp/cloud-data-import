import {AwsServices} from '@/constants'
import {AwsScannerConfig} from './types'

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

export const scannerConfigs: {
	[K in AwsServices]: AwsScannerConfig<K>
} = {
	[AwsServices.ATHENA_NAMED_QUERIES]: {
		service: AwsServices.ATHENA_NAMED_QUERIES,
		handler: getAthenaNamedQueries,
	},
	[AwsServices.AUTOSCALING_GROUPS]: {
		service: AwsServices.AUTOSCALING_GROUPS,
		handler: getAutoScalingResources,
	},
	[AwsServices.CLOUDFRONT_DISTRIBUTIONS]: {
		service: AwsServices.CLOUDFRONT_DISTRIBUTIONS,
		handler: getCloudFrontDistributions,
		global: true,
	},
	[AwsServices.CLOUDTRAIL_TRAILS]: {
		service: AwsServices.CLOUDTRAIL_TRAILS,
		handler: getCloudTrailTrails,
	},
	[AwsServices.CLOUDWATCH_METRIC_ALARMS]: {
		service: AwsServices.CLOUDWATCH_METRIC_ALARMS,
		handler: getCloudWatchMetricAlarms,
	},
	[AwsServices.CLOUDWATCH_METRIC_STREAMS]: {
		service: AwsServices.CLOUDWATCH_METRIC_STREAMS,
		handler: getCloudWatchMetricStreams,
	},
	[AwsServices.DYNAMODB_TABLES]: {
		service: AwsServices.DYNAMODB_TABLES,
		handler: getDynamoDBTables,
	},
	[AwsServices.EC2_INSTANCES]: {
		service: AwsServices.EC2_INSTANCES,
		handler: getEC2Instances,
	},
	[AwsServices.EC2_VPCS]: {
		service: AwsServices.EC2_VPCS,
		handler: getEC2Vpcs,
	},
	[AwsServices.EC2_VPC_ENDPOINTS]: {
		service: AwsServices.EC2_VPC_ENDPOINTS,
		handler: getEC2VpcEndpoints,
	},
	[AwsServices.EC2_SUBNETS]: {
		service: AwsServices.EC2_SUBNETS,
		handler: getEC2Subnets,
	},
	[AwsServices.EC2_ROUTE_TABLES]: {
		service: AwsServices.EC2_ROUTE_TABLES,
		handler: getEC2RouteTables,
	},
	[AwsServices.EC2_INTERNET_GATEWAYS]: {
		service: AwsServices.EC2_INTERNET_GATEWAYS,
		handler: getEC2InternetGateways,
	},
	[AwsServices.EC2_NAT_GATEWAYS]: {
		service: AwsServices.EC2_NAT_GATEWAYS,
		handler: getEC2NatGateways,
	},
	[AwsServices.EC2_NETWORK_ACLS]: {
		service: AwsServices.EC2_NETWORK_ACLS,
		handler: getEC2NetworkAcls,
	},
	[AwsServices.EC2_TRANSIT_GATEWAYS]: {
		service: AwsServices.EC2_TRANSIT_GATEWAYS,
		handler: getEC2TransitGateways,
	},
	[AwsServices.EC2_VOLUMES]: {
		service: AwsServices.EC2_VOLUMES,
		handler: getEC2Volumes,
	},
	[AwsServices.EC2_VPN_GATEWAYS]: {
		service: AwsServices.EC2_VPN_GATEWAYS,
		handler: getEC2VpnGateways,
	},
	[AwsServices.EC2_NETWORK_INTERFACES]: {
		service: AwsServices.EC2_NETWORK_INTERFACES,
		handler: getEC2NetworkInterfaces,
	},
	[AwsServices.ECS_CLUSTERS]: {
		service: AwsServices.ECS_CLUSTERS,
		handler: getECSClusters,
	},
	[AwsServices.ECS_SERVICES]: {
		service: AwsServices.ECS_SERVICES,
		handler: getECSServices,
	},
	[AwsServices.ECS_TASKS]: {
		service: AwsServices.ECS_TASKS,
		handler: getECSTasks,
	},
	[AwsServices.EFS_FILE_SYSTEMS]: {
		service: AwsServices.EFS_FILE_SYSTEMS,
		handler: getEFSFileSystems,
	},
	[AwsServices.EKS_CLUSTERS]: {
		service: AwsServices.EKS_CLUSTERS,
		handler: getEKSClusters,
	},
	[AwsServices.ELASTICACHE_CLUSTERS]: {
		service: AwsServices.ELASTICACHE_CLUSTERS,
		handler: getElastiCacheClusters,
	},
	[AwsServices.ELBV2_LOAD_BALANCERS]: {
		service: AwsServices.ELBV2_LOAD_BALANCERS,
		handler: getELBv2LoadBalancers,
	},
	[AwsServices.ELBV2_TARGET_GROUPS]: {
		service: AwsServices.ELBV2_TARGET_GROUPS,
		handler: getELBv2TargetGroups,
	},
	[AwsServices.ELBV1_LOAD_BALANCERS]: {
		service: AwsServices.ELBV1_LOAD_BALANCERS,
		handler: getELBv1LoadBalancers,
	},
	[AwsServices.LAMBDA_FUNCTIONS]: {
		service: AwsServices.LAMBDA_FUNCTIONS,
		handler: getLambdaFunctions,
	},
	[AwsServices.RDS_INSTANCES]: {
		service: AwsServices.RDS_INSTANCES,
		handler: getRDSInstances,
	},
	[AwsServices.RDS_CLUSTERS]: {
		service: AwsServices.RDS_CLUSTERS,
		handler: getRDSClusters,
	},
	[AwsServices.RDS_PROXIES]: {
		service: AwsServices.RDS_PROXIES,
		handler: getRDSProxies,
	},
	[AwsServices.REDSHIFT_CLUSTERS]: {
		service: AwsServices.REDSHIFT_CLUSTERS,
		handler: getRedshiftClusters,
	},
	[AwsServices.ROUTE53_HOSTED_ZONES]: {
		service: AwsServices.ROUTE53_HOSTED_ZONES,
		handler: getHostedZones,
		global: true,
	},
	[AwsServices.S3_BUCKETS]: {
		service: AwsServices.S3_BUCKETS,
		handler: getS3Buckets,
		global: true,
	},
	[AwsServices.SNS_TOPICS]: {
		service: AwsServices.SNS_TOPICS,
		handler: getSNSTopics,
	},
	[AwsServices.SQS_QUEUES]: {
		service: AwsServices.SQS_QUEUES,
		handler: getSQSQueues,
	},
}
