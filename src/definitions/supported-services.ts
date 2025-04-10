import type * as AutoScaling from '@aws-sdk/client-auto-scaling'
import type * as CloudTrail from '@aws-sdk/client-cloudtrail'
import type * as DynamoDB from '@aws-sdk/client-dynamodb'
import type * as EC2 from '@aws-sdk/client-ec2'
import type * as Lambda from '@aws-sdk/client-lambda'
import type * as RDS from '@aws-sdk/client-rds'
import type * as S3 from '@aws-sdk/client-s3'
import type * as ECS from '@aws-sdk/client-ecs'
import type * as EKS from '@aws-sdk/client-eks'
import type * as SNS from '@aws-sdk/client-sns'
import type * as Route53 from '@aws-sdk/client-route-53'
import type * as ELBv2 from '@aws-sdk/client-elastic-load-balancing-v2'
import type * as ELBv1 from '@aws-sdk/client-elastic-load-balancing'
import type * as CloudFront from '@aws-sdk/client-cloudfront'
import type * as EFS from '@aws-sdk/client-efs'
import type * as SQS from '@aws-sdk/client-sqs'
import type * as ElastiCache from '@aws-sdk/client-elasticache'
import type * as Redshift from '@aws-sdk/client-redshift'
import type * as CloudWatch from '@aws-sdk/client-cloudwatch'
import type * as Athena from '@aws-sdk/client-athena'
import type * as OpenSearch from '@aws-sdk/client-opensearch'

export enum AwsSupportedResources {
	ATHENA_NAMED_QUERIES = 'ATHENA_NAMED_QUERIES',
	AUTOSCALING_GROUPS = 'AUTOSCALING_GROUPS',
	CLOUDFRONT_DISTRIBUTIONS = 'CLOUDFRONT_DISTRIBUTIONS',
	CLOUDTRAIL_TRAILS = 'CLOUDTRAIL_TRAILS',
	CLOUDWATCH_METRIC_ALARMS = 'CLOUDWATCH_METRIC_ALARMS',
	CLOUDWATCH_METRIC_STREAMS = 'CLOUDWATCH_METRIC_STREAMS',
	DYNAMODB_TABLES = 'DYNAMODB_TABLES',
	EC2_INSTANCES = 'EC2_INSTANCES',
	EC2_VPCS = 'EC2_VPCS',
	EC2_VPC_ENDPOINTS = 'EC2_VPC_ENDPOINTS',
	EC2_SUBNETS = 'EC2_SUBNETS',
	EC2_ROUTE_TABLES = 'EC2_ROUTE_TABLES',
	EC2_INTERNET_GATEWAYS = 'EC2_INTERNET_GATEWAYS',
	EC2_NAT_GATEWAYS = 'EC2_NAT_GATEWAYS',
	EC2_TRANSIT_GATEWAYS = 'EC2_TRANSIT_GATEWAYS',
	EC2_VOLUMES = 'EC2_VOLUMES',
	EC2_NETWORK_ACLS = 'EC2_NETWORK_ACLS',
	EC2_VPN_GATEWAYS = 'EC2_VPN_GATEWAYS',
	EC2_NETWORK_INTERFACES = 'EC2_NETWORK_INTERFACES',
	ECS_CLUSTERS = 'ECS_CLUSTERS',
	ECS_SERVICES = 'ECS_SERVICES',
	ECS_TASKS = 'ECS_TASKS',
	EFS_FILE_SYSTEMS = 'EFS_FILE_SYSTEMS',
	ELASTICACHE_CLUSTERS = 'ELASTICACHE_CLUSTERS',
	ELBV2_LOAD_BALANCERS = 'ELBV2_LOAD_BALANCERS',
	ELBV2_TARGET_GROUPS = 'ELBV2_TARGET_GROUPS',
	ELBV1_LOAD_BALANCERS = 'ELBV1_LOAD_BALANCERS',
	EKS_CLUSTERS = 'EKS_CLUSTERS',
	LAMBDA_FUNCTIONS = 'LAMBDA_FUNCTIONS',
	OPENSEARCH_DOMAINS = 'OPENSEARCH_DOMAINS',
	REDSHIFT_CLUSTERS = 'REDSHIFT_CLUSTERS',
	RDS_INSTANCES = 'RDS_INSTANCES',
	RDS_CLUSTERS = 'RDS_CLUSTERS',
	RDS_PROXIES = 'RDS_PROXIES',
	S3_BUCKETS = 'S3_BUCKETS',
	SNS_TOPICS = 'SNS_TOPICS',
	SQS_QUEUES = 'SQS_QUEUES',
	ROUTE53_HOSTED_ZONES = 'ROUTE53_HOSTED_ZONES',
}

export enum AwsSupportedManagementServices {
	RESOURCE_GROUP_TAGGING = 'RESOURCE_GROUP_TAGGING',
}

export type AllSupportedAwsServices = AwsSupportedResources | AwsSupportedManagementServices

export const awsResourceNames: Record<AwsSupportedResources, string> = {
	[AwsSupportedResources.ATHENA_NAMED_QUERIES]: 'Athena Named Queries',
	[AwsSupportedResources.AUTOSCALING_GROUPS]: 'Auto Scaling Groups',
	[AwsSupportedResources.CLOUDFRONT_DISTRIBUTIONS]: 'CloudFront Distributions',
	[AwsSupportedResources.CLOUDTRAIL_TRAILS]: 'CloudTrail Trails',
	[AwsSupportedResources.CLOUDWATCH_METRIC_ALARMS]: 'CloudWatch Alarms',
	[AwsSupportedResources.CLOUDWATCH_METRIC_STREAMS]: 'CloudWatch Metric Streams',
	[AwsSupportedResources.DYNAMODB_TABLES]: 'DynamoDB Tables',
	[AwsSupportedResources.EC2_INSTANCES]: 'EC2 Instances',
	[AwsSupportedResources.EC2_VPCS]: 'EC2 VPCs',
	[AwsSupportedResources.EC2_VPC_ENDPOINTS]: 'EC2 VPC Endpoints',
	[AwsSupportedResources.EC2_SUBNETS]: 'EC2 Subnets',
	[AwsSupportedResources.EC2_ROUTE_TABLES]: 'EC2 Route Tables',
	[AwsSupportedResources.EC2_INTERNET_GATEWAYS]: 'EC2 Internet Gateways',
	[AwsSupportedResources.EC2_NAT_GATEWAYS]: 'EC2 NAT Gateways',
	[AwsSupportedResources.EC2_TRANSIT_GATEWAYS]: 'EC2 Transit Gateways',
	[AwsSupportedResources.EC2_VOLUMES]: 'EC2 Volumes',
	[AwsSupportedResources.EC2_NETWORK_ACLS]: 'EC2 Network ACLs',
	[AwsSupportedResources.EC2_VPN_GATEWAYS]: 'EC2 VPN Gateways',
	[AwsSupportedResources.EC2_NETWORK_INTERFACES]: 'EC2 Network Interfaces',
	[AwsSupportedResources.ECS_CLUSTERS]: 'ECS Clusters',
	[AwsSupportedResources.ECS_SERVICES]: 'ECS Services',
	[AwsSupportedResources.ECS_TASKS]: 'ECS Tasks',
	[AwsSupportedResources.EFS_FILE_SYSTEMS]: 'EFS File Systems',
	[AwsSupportedResources.ELASTICACHE_CLUSTERS]: 'ElastiCache Clusters',
	[AwsSupportedResources.ELBV2_LOAD_BALANCERS]: 'ELBv2 Load Balancers',
	[AwsSupportedResources.ELBV2_TARGET_GROUPS]: 'ELBv2 Target Groups',
	[AwsSupportedResources.ELBV1_LOAD_BALANCERS]: 'ELBv1 Load Balancers',
	[AwsSupportedResources.EKS_CLUSTERS]: 'EKS Clusters',
	[AwsSupportedResources.LAMBDA_FUNCTIONS]: 'Lambda Functions',
	[AwsSupportedResources.OPENSEARCH_DOMAINS]: 'OpenSearch Domains',
	[AwsSupportedResources.REDSHIFT_CLUSTERS]: 'Redshift Clusters',
	[AwsSupportedResources.RDS_INSTANCES]: 'RDS Instances',
	[AwsSupportedResources.RDS_CLUSTERS]: 'RDS Clusters',
	[AwsSupportedResources.RDS_PROXIES]: 'RDS Proxies',
	[AwsSupportedResources.S3_BUCKETS]: 'S3 Buckets',
	[AwsSupportedResources.SNS_TOPICS]: 'SNS Topics',
	[AwsSupportedResources.SQS_QUEUES]: 'SQS Queues',
	[AwsSupportedResources.ROUTE53_HOSTED_ZONES]: 'Route 53 Hosted Zones',
}

export const awsManagementServiceNames: Record<AwsSupportedManagementServices, string> = {
	[AwsSupportedManagementServices.RESOURCE_GROUP_TAGGING]: 'Resource Group Tagging',
}

/**
 * Mapping AWS resource types to their corresponding service codes used in the AWS Resource Groups Tagging API.
 */
export const awsTaggingFilterResourceTypes: Record<AwsSupportedResources, string> = {
	[AwsSupportedResources.ATHENA_NAMED_QUERIES]: 'athena:named-query',
	[AwsSupportedResources.AUTOSCALING_GROUPS]: 'autoscaling:group',
	[AwsSupportedResources.CLOUDTRAIL_TRAILS]: 'cloudtrail:trail',
	[AwsSupportedResources.CLOUDWATCH_METRIC_ALARMS]: 'cloudwatch:alarm',
	[AwsSupportedResources.CLOUDWATCH_METRIC_STREAMS]: 'cloudwatch:metric-stream',
	[AwsSupportedResources.DYNAMODB_TABLES]: 'dynamodb:table',
	[AwsSupportedResources.EC2_INSTANCES]: 'ec2:instance',
	[AwsSupportedResources.EC2_VPCS]: 'ec2:vpc',
	[AwsSupportedResources.EC2_VPC_ENDPOINTS]: 'ec2:vpc-endpoint',
	[AwsSupportedResources.EC2_SUBNETS]: 'ec2:subnet',
	[AwsSupportedResources.EC2_ROUTE_TABLES]: 'ec2:route-table',
	[AwsSupportedResources.EC2_INTERNET_GATEWAYS]: 'ec2:internet-gateway',
	[AwsSupportedResources.EC2_NAT_GATEWAYS]: 'ec2:nat-gateway',
	[AwsSupportedResources.EC2_TRANSIT_GATEWAYS]: 'ec2:transit-gateway',
	[AwsSupportedResources.EC2_VOLUMES]: 'ec2:volume',
	[AwsSupportedResources.EC2_NETWORK_ACLS]: 'ec2:network-acl',
	[AwsSupportedResources.EC2_VPN_GATEWAYS]: 'ec2:vpn-gateway',
	[AwsSupportedResources.EC2_NETWORK_INTERFACES]: 'ec2:network-interface',
	[AwsSupportedResources.ECS_CLUSTERS]: 'ecs:cluster',
	[AwsSupportedResources.ECS_SERVICES]: 'ecs:service',
	[AwsSupportedResources.ECS_TASKS]: 'ecs:task',
	[AwsSupportedResources.EFS_FILE_SYSTEMS]: 'elasticfilesystem:file-system',
	[AwsSupportedResources.ELASTICACHE_CLUSTERS]: 'elasticache:cluster',
	[AwsSupportedResources.ELBV2_LOAD_BALANCERS]: 'elasticloadbalancing:loadbalancer',
	[AwsSupportedResources.ELBV2_TARGET_GROUPS]: 'elasticloadbalancing:targetgroup',
	[AwsSupportedResources.ELBV1_LOAD_BALANCERS]: 'elasticloadbalancing:loadbalancer',
	[AwsSupportedResources.EKS_CLUSTERS]: 'eks:cluster',
	[AwsSupportedResources.LAMBDA_FUNCTIONS]: 'lambda:function',
	[AwsSupportedResources.OPENSEARCH_DOMAINS]: 'es:domain',
	[AwsSupportedResources.REDSHIFT_CLUSTERS]: 'redshift:cluster',
	[AwsSupportedResources.RDS_INSTANCES]: 'rds:db',
	[AwsSupportedResources.RDS_CLUSTERS]: 'rds:cluster',
	[AwsSupportedResources.RDS_PROXIES]: 'rds:proxy',
	[AwsSupportedResources.S3_BUCKETS]: 's3:bucket',
	[AwsSupportedResources.SNS_TOPICS]: 'sns:topic',
	[AwsSupportedResources.SQS_QUEUES]: 'sqs:queue',
	[AwsSupportedResources.ROUTE53_HOSTED_ZONES]: 'route53:hostedzone',
	[AwsSupportedResources.CLOUDFRONT_DISTRIBUTIONS]: 'cloudfront:distribution',
}

/**
 * Type mapping for AWS resource descriptions
 */
export type AwsResourceDescriptionMap = {
	[AwsSupportedResources.ATHENA_NAMED_QUERIES]: Athena.NamedQuery
	[AwsSupportedResources.AUTOSCALING_GROUPS]: AutoScaling.AutoScalingGroup
	[AwsSupportedResources.CLOUDFRONT_DISTRIBUTIONS]: CloudFront.DistributionSummary
	[AwsSupportedResources.CLOUDTRAIL_TRAILS]: CloudTrail.TrailInfo
	[AwsSupportedResources.CLOUDWATCH_METRIC_ALARMS]: CloudWatch.MetricAlarm
	[AwsSupportedResources.CLOUDWATCH_METRIC_STREAMS]: CloudWatch.MetricStreamEntry
	[AwsSupportedResources.DYNAMODB_TABLES]: DynamoDB.TableDescription
	[AwsSupportedResources.EC2_INSTANCES]: EC2.Instance
	[AwsSupportedResources.EC2_INTERNET_GATEWAYS]: EC2.InternetGateway
	[AwsSupportedResources.EC2_NAT_GATEWAYS]: EC2.NatGateway
	[AwsSupportedResources.EC2_NETWORK_ACLS]: EC2.NetworkAcl
	[AwsSupportedResources.EC2_NETWORK_INTERFACES]: EC2.NetworkInterface
	[AwsSupportedResources.EC2_ROUTE_TABLES]: EC2.RouteTable
	[AwsSupportedResources.EC2_SUBNETS]: EC2.Subnet
	[AwsSupportedResources.EC2_TRANSIT_GATEWAYS]: EC2.TransitGateway
	[AwsSupportedResources.EC2_VOLUMES]: EC2.Volume
	[AwsSupportedResources.EC2_VPC_ENDPOINTS]: EC2.VpcEndpoint
	[AwsSupportedResources.EC2_VPCS]: EC2.Vpc
	[AwsSupportedResources.EC2_VPN_GATEWAYS]: EC2.VpnGateway
	[AwsSupportedResources.ECS_CLUSTERS]: ECS.Cluster
	[AwsSupportedResources.ECS_SERVICES]: ECS.Service
	[AwsSupportedResources.ECS_TASKS]: ECS.Task
	[AwsSupportedResources.EFS_FILE_SYSTEMS]: EFS.FileSystemDescription
	[AwsSupportedResources.EKS_CLUSTERS]: EKS.Cluster
	[AwsSupportedResources.ELASTICACHE_CLUSTERS]: ElastiCache.CacheCluster
	[AwsSupportedResources.ELBV1_LOAD_BALANCERS]: ELBv1.LoadBalancerDescription
	[AwsSupportedResources.ELBV2_LOAD_BALANCERS]: ELBv2.LoadBalancer
	[AwsSupportedResources.ELBV2_TARGET_GROUPS]: ELBv2.TargetGroup
	[AwsSupportedResources.LAMBDA_FUNCTIONS]: Lambda.FunctionConfiguration
	[AwsSupportedResources.OPENSEARCH_DOMAINS]: OpenSearch.DomainStatus
	[AwsSupportedResources.RDS_CLUSTERS]: RDS.DBCluster
	[AwsSupportedResources.RDS_INSTANCES]: RDS.DBInstance
	[AwsSupportedResources.RDS_PROXIES]: RDS.DBProxy
	[AwsSupportedResources.REDSHIFT_CLUSTERS]: Redshift.Cluster
	[AwsSupportedResources.ROUTE53_HOSTED_ZONES]: Route53.HostedZone & {
		Account: string
	}
	[AwsSupportedResources.S3_BUCKETS]: S3.Bucket & {
		Account: string
		Location: string
	}
	[AwsSupportedResources.SNS_TOPICS]: SNS.Topic
	[AwsSupportedResources.SQS_QUEUES]: NonNullable<SQS.GetQueueAttributesResult['Attributes']>
}
