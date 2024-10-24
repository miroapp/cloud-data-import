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
	ATHENA_NAMED_QUERIES = 'athena:named-queries',
	AUTOSCALING_GROUPS = 'autoscaling:groups',
	CLOUDTRAIL_TRAILS = 'cloudtrail:trails',
	CLOUDWATCH_METRIC_ALARMS = 'cloudwatch:metric-alarms',
	CLOUDWATCH_METRIC_STREAMS = 'cloudwatch:metric-streams',
	DYNAMODB_TABLES = 'dynamodb:tables',
	EC2_INSTANCES = 'ec2:instances',
	EC2_VPCS = 'ec2:vpcs',
	EC2_VPC_ENDPOINTS = 'ec2:vpc-endpoints',
	EC2_SUBNETS = 'ec2:subnets',
	EC2_ROUTE_TABLES = 'ec2:route-tables',
	EC2_INTERNET_GATEWAYS = 'ec2:internet-gateways',
	EC2_NAT_GATEWAYS = 'ec2:nat-gateways',
	EC2_TRANSIT_GATEWAYS = 'ec2:transit-gateways',
	EC2_VOLUMES = 'ec2:volumes',
	EC2_NETWORK_ACLS = 'ec2:network-acls',
	EC2_VPN_GATEWAYS = 'ec2:vpn-gateways',
	EC2_NETWORK_INTERFACES = 'ec2:network-interfaces',
	ECS_CLUSTERS = 'ecs:clusters',
	ECS_SERVICES = 'ecs:services',
	ECS_TASKS = 'ecs:tasks',
	EFS_FILE_SYSTEMS = 'efs:file-systems',
	ELASTICACHE_CLUSTERS = 'elasticache:clusters',
	ELBV2_LOAD_BALANCERS = 'elasticloadbalancingv2:loadbalancer',
	ELBV2_TARGET_GROUPS = 'elasticloadbalancingv2:targetgroup',
	ELBV1_LOAD_BALANCERS = 'elbv1:load-balancers',
	EKS_CLUSTERS = 'eks:clusters',
	LAMBDA_FUNCTIONS = 'lambda:functions',
	REDSHIFT_CLUSTERS = 'redshift:clusters',
	RDS_INSTANCES = 'rds:instances',
	RDS_CLUSTERS = 'rds:clusters',
	RDS_PROXIES = 'rds:proxies',
	S3_BUCKETS = 's3:buckets',
	SNS_TOPICS = 'sns:topics',
	SQS_QUEUES = 'sqs:queues',
	ROUTE53_HOSTED_ZONES = 'route53:hosted-zones',
	CLOUDFRONT_DISTRIBUTIONS = 'cloudfront:distributions',
}
