import {
	EC2Client,
	DescribeInstancesCommand,
	DescribeVpcsCommand,
	DescribeVpcEndpointsCommand,
	DescribeInternetGatewaysCommand,
	DescribeNatGatewaysCommand,
	DescribeSubnetsCommand,
	DescribeVolumesCommand,
	DescribeRouteTablesCommand,
	DescribeTransitGatewaysCommand,
	Instance,
	Vpc,
	VpcEndpoint,
	InternetGateway,
	NatGateway,
	Subnet,
	Volume,
	RouteTable,
	TransitGateway,
} from '@aws-sdk/client-ec2'
import {Credentials, Resources} from '@/types'
import {RateLimiter} from '@/scanners/common/RateLimiter'
import {getAwsAccountId} from './common/getAwsAccountId'
import {buildARN} from './common/buildArn'

async function getInstances(client: EC2Client, rateLimiter: RateLimiter): Promise<Instance[]> {
	const describeInstancesCommand = new DescribeInstancesCommand({})
	const describeInstancesResponse = await rateLimiter.throttle(() => client.send(describeInstancesCommand))
	const instances: Instance[] =
		describeInstancesResponse.Reservations?.flatMap((reservation) => reservation.Instances || []) || []
	return instances
}

async function getVpcs(client: EC2Client, rateLimiter: RateLimiter): Promise<Vpc[]> {
	const describeVpcsCommand = new DescribeVpcsCommand({})
	const describeVpcsResponse = await rateLimiter.throttle(() => client.send(describeVpcsCommand))
	const vpcs: Vpc[] = describeVpcsResponse.Vpcs || []
	return vpcs
}

async function getVpcEndpoints(client: EC2Client, rateLimiter: RateLimiter): Promise<VpcEndpoint[]> {
	const describeVpcEndpointsCommand = new DescribeVpcEndpointsCommand({})
	const describeVpcEndpointsResponse = await rateLimiter.throttle(() => client.send(describeVpcEndpointsCommand))
	const vpcEndpoints: VpcEndpoint[] = describeVpcEndpointsResponse.VpcEndpoints || []
	return vpcEndpoints
}

async function getInternetGateways(client: EC2Client, rateLimiter: RateLimiter): Promise<InternetGateway[]> {
	const describeInternetGatewaysCommand = new DescribeInternetGatewaysCommand({})
	const describeInternetGatewaysResponse = await rateLimiter.throttle(() =>
		client.send(describeInternetGatewaysCommand),
	)
	const internetGateways: InternetGateway[] = describeInternetGatewaysResponse.InternetGateways || []
	return internetGateways
}

async function getNatGateways(client: EC2Client, rateLimiter: RateLimiter): Promise<NatGateway[]> {
	const describeNatGatewaysCommand = new DescribeNatGatewaysCommand({})
	const describeNatGatewaysResponse = await rateLimiter.throttle(() => client.send(describeNatGatewaysCommand))
	const natGateways: NatGateway[] = describeNatGatewaysResponse.NatGateways || []
	return natGateways
}

async function getSubnets(client: EC2Client, rateLimiter: RateLimiter): Promise<Subnet[]> {
	const describeSubnetsCommand = new DescribeSubnetsCommand({})
	const describeSubnetsResponse = await rateLimiter.throttle(() => client.send(describeSubnetsCommand))
	const subnets: Subnet[] = describeSubnetsResponse.Subnets || []
	return subnets
}

async function getVolumes(client: EC2Client, rateLimiter: RateLimiter): Promise<Volume[]> {
	const describeVolumesCommand = new DescribeVolumesCommand({})
	const describeVolumesResponse = await rateLimiter.throttle(() => client.send(describeVolumesCommand))
	const volumes: Volume[] = describeVolumesResponse.Volumes || []
	return volumes
}

async function getRouteTables(client: EC2Client, rateLimiter: RateLimiter): Promise<RouteTable[]> {
	const describeRouteTablesCommand = new DescribeRouteTablesCommand({})
	const describeRouteTablesResponse = await rateLimiter.throttle(() => client.send(describeRouteTablesCommand))
	const routeTables: RouteTable[] = describeRouteTablesResponse.RouteTables || []
	return routeTables
}

async function getTransitGateways(client: EC2Client, rateLimiter: RateLimiter): Promise<TransitGateway[]> {
	const describeTransitGatewaysCommand = new DescribeTransitGatewaysCommand({})
	const describeTransitGatewaysResponse = await rateLimiter.throttle(() => client.send(describeTransitGatewaysCommand))
	const transitGateways: TransitGateway[] = describeTransitGatewaysResponse.TransitGateways || []
	return transitGateways
}

export async function getEC2Resources(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<
	Resources<Instance | Vpc | VpcEndpoint | InternetGateway | NatGateway | Subnet | Volume | RouteTable | TransitGateway>
> {
	const client = new EC2Client({credentials, region})

	const instances = await getInstances(client, rateLimiter)
	const vpcs = await getVpcs(client, rateLimiter)
	const vpcEndpoints = await getVpcEndpoints(client, rateLimiter)
	const internetGateways = await getInternetGateways(client, rateLimiter)
	const natGateways = await getNatGateways(client, rateLimiter)
	const subnets = await getSubnets(client, rateLimiter)
	const volumes = await getVolumes(client, rateLimiter)
	const routeTables = await getRouteTables(client, rateLimiter)
	const transitGateways = await getTransitGateways(client, rateLimiter)

	const resources: Resources<
		Instance | Vpc | VpcEndpoint | InternetGateway | NatGateway | Subnet | Volume | RouteTable | TransitGateway
	> = {}

	const accountId = await getAwsAccountId()

	const getEC2ARN = (resourceType: string, resourceId: string): string =>
		buildARN({
			service: 'ec2',
			region,
			accountId: accountId,
			resource: `${resourceType}/${resourceId}`,
		})

	for (const instance of instances) {
		if (instance.InstanceId) {
			const arn = getEC2ARN('instance', instance.InstanceId)
			resources[arn] = instance
		}
	}

	for (const vpc of vpcs) {
		if (vpc.VpcId) {
			const arn = getEC2ARN('vpc', vpc.VpcId)
			resources[arn] = vpc
		}
	}

	for (const vpcEndpoint of vpcEndpoints) {
		if (vpcEndpoint.VpcEndpointId) {
			const arn = getEC2ARN('vpc-endpoint', vpcEndpoint.VpcEndpointId)
			resources[arn] = vpcEndpoint
		}
	}

	for (const internetGateway of internetGateways) {
		if (internetGateway.InternetGatewayId) {
			const arn = getEC2ARN('internet-gateway', internetGateway.InternetGatewayId)
			resources[arn] = internetGateway
		}
	}

	for (const natGateway of natGateways) {
		if (natGateway.NatGatewayId) {
			const arn = getEC2ARN('nat-gateway', natGateway.NatGatewayId)
			resources[arn] = natGateway
		}
	}

	for (const subnet of subnets) {
		if (subnet.SubnetId) {
			const arn = getEC2ARN('subnet', subnet.SubnetId)
			resources[arn] = subnet
		}
	}

	for (const volume of volumes) {
		if (volume.VolumeId) {
			const arn = getEC2ARN('volume', volume.VolumeId)
			resources[arn] = volume
		}
	}

	for (const routeTable of routeTables) {
		if (routeTable.RouteTableId) {
			const arn = getEC2ARN('route-table', routeTable.RouteTableId)
			resources[arn] = routeTable
		}
	}

	for (const transitGateway of transitGateways) {
		if (transitGateway.TransitGatewayId) {
			const arn = getEC2ARN('transit-gateway', transitGateway.TransitGatewayId)
			resources[arn] = transitGateway
		}
	}

	return resources
}
