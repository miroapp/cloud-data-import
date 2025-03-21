// This list is extracted from https://docs.aws.amazon.com/general/latest/gr/rande.html
// Tip: check git history to see when was the last time this list was updated
export const awsRegionIds = [
	'us-east-2',
	'us-east-1',
	'us-west-1',
	'us-west-2',
	'af-south-1',
	'ap-east-1',
	'ap-south-2',
	'ap-southeast-3',
	'ap-southeast-4',
	'ap-south-1',
	'ap-northeast-3',
	'ap-northeast-2',
	'ap-southeast-1',
	'ap-southeast-2',
	'ap-northeast-1',
	'ca-central-1',
	'ca-west-1',
	'eu-central-1',
	'eu-west-1',
	'eu-west-2',
	'eu-south-1',
	'eu-west-3',
	'eu-south-2',
	'eu-north-1',
	'eu-central-2',
	'il-central-1',
	'me-south-1',
	'me-central-1',
	'sa-east-1',
	'us-gov-east-1',
	'us-gov-west-1',
] as const

/**
 * When adding a new AWS service resource type to the AwsServices enum:
 *
 * 1. Refer to the AWS Resource Groups Tagging API documentation for the list of supported resource types.
 * 2. Use the exact 'service-code:resource-type' string from the documentation.
 * 3. Add the new service to the enum using a descriptive key.
 */
export enum AwsServices {
	ATHENA_NAMED_QUERIES = 'athena:named-query',
	AUTOSCALING_GROUPS = 'autoscaling:group',
	CLOUDTRAIL_TRAILS = 'cloudtrail:trail',
	CLOUDWATCH_METRIC_ALARMS = 'cloudwatch:metric-alarm',
	CLOUDWATCH_METRIC_STREAMS = 'cloudwatch:metric-stream',
	DYNAMODB_TABLES = 'dynamodb:table',
	EC2_INSTANCES = 'ec2:instance',
	EC2_VPCS = 'ec2:vpc',
	EC2_VPC_ENDPOINTS = 'ec2:vpc-endpoint',
	EC2_SUBNETS = 'ec2:subnet',
	EC2_ROUTE_TABLES = 'ec2:route-table',
	EC2_INTERNET_GATEWAYS = 'ec2:internet-gateway',
	EC2_NAT_GATEWAYS = 'ec2:nat-gateway',
	EC2_TRANSIT_GATEWAYS = 'ec2:transit-gateway',
	EC2_VOLUMES = 'ec2:volume',
	EC2_NETWORK_ACLS = 'ec2:network-acl',
	EC2_VPN_GATEWAYS = 'ec2:vpn-gateway',
	EC2_NETWORK_INTERFACES = 'ec2:network-interface',
	ECS_CLUSTERS = 'ecs:cluster',
	ECS_SERVICES = 'ecs:service',
	ECS_TASKS = 'ecs:task',
	EFS_FILE_SYSTEMS = 'efs:file-system',
	ELASTICACHE_CLUSTERS = 'elasticache:cluster',
	ELBV2_LOAD_BALANCERS = 'elasticloadbalancingv2:loadbalancer',
	ELBV2_TARGET_GROUPS = 'elasticloadbalancingv2:targetgroup',
	ELBV1_LOAD_BALANCERS = 'elbv1:load-balancer',
	EKS_CLUSTERS = 'eks:cluster',
	LAMBDA_FUNCTIONS = 'lambda:function',
	REDSHIFT_CLUSTERS = 'redshift:cluster',
	RDS_INSTANCES = 'rds:instance',
	RDS_CLUSTERS = 'rds:cluster',
	RDS_PROXIES = 'rds:proxy',
	S3_BUCKETS = 's3:bucket',
	SNS_TOPICS = 'sns:topic',
	SQS_QUEUES = 'sqs:queue',
	ROUTE53_HOSTED_ZONES = 'route53:hosted-zone',
	CLOUDFRONT_DISTRIBUTIONS = 'cloudfront:distribution',
}

/**
 * Maps AWS service enum values to their corresponding resource type filter strings.
 * In most cases, the filter string is the same as the service enum value. However, some services have exceptions.
 */
export const awsServiceToFilterServiceCode: Record<AwsServices, string> = {
	...Object.values(AwsServices).reduce(
		(acc, service) => {
			acc[service] = service
			return acc
		},
		{} as Record<AwsServices, string>,
	),
	[AwsServices.ELBV1_LOAD_BALANCERS]: 'elasticloadbalancing:loadbalancer',
	[AwsServices.ELBV2_LOAD_BALANCERS]: 'elasticloadbalancing:loadbalancer',
	[AwsServices.ELBV2_TARGET_GROUPS]: 'elasticloadbalancing:targetgroup',
	[AwsServices.S3_BUCKETS]: 's3',
	[AwsServices.CLOUDWATCH_METRIC_ALARMS]: 'cloudwatch:alarm',
	[AwsServices.EFS_FILE_SYSTEMS]: 'elasticfilesystem:filesystem',
	[AwsServices.RDS_INSTANCES]: 'rds:db',
	[AwsServices.ROUTE53_HOSTED_ZONES]: 'route53:hostedzone',
}
