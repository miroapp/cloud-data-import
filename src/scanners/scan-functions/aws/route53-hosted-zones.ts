import {Route53Client, ListHostedZonesCommand, GetHostedZoneCommand} from '@aws-sdk/client-route-53'
import {AwsCredentials, RateLimiter, AwsResources} from '@/types'
import {buildARN} from './common/buildArn'
import {getAwsAccountId} from './common/getAwsAccountId'
import {AwsServices} from '@/constants'

export async function getHostedZones(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
): Promise<AwsResources<AwsServices.ROUTE53_HOSTED_ZONES>> {
	const client = new Route53Client({credentials})

	const accountId = await getAwsAccountId(credentials)

	const hostedZones: AwsResources<AwsServices.ROUTE53_HOSTED_ZONES> = {}

	let marker: string | undefined
	do {
		const listHostedZonesCommand = new ListHostedZonesCommand({
			Marker: marker,
		})

		const listHostedZonesResponse = await rateLimiter.throttle(() => client.send(listHostedZonesCommand))

		if (listHostedZonesResponse.HostedZones) {
			for (const hostedZone of listHostedZonesResponse.HostedZones) {
				if (!hostedZone.Id) {
					throw new Error('HostedZoneId is missing in the response')
				}

				const getHostedZoneCommand = new GetHostedZoneCommand({Id: hostedZone.Id})
				const getHostedZoneResponse = await rateLimiter.throttle(() => client.send(getHostedZoneCommand))

				if (getHostedZoneResponse.HostedZone) {
					const arn = buildARN({
						service: 'route53',
						region: '', // Route53 is a global service
						accountId: '', // Route53 does not use account ID in ARN
						resource: `hostedzone/${hostedZone.Id.split('/').pop()}`,
					})
					hostedZones[arn] = {
						Account: accountId,
						...getHostedZoneResponse.HostedZone,
					}
				}
			}
		}

		marker = listHostedZonesResponse.Marker
	} while (marker)

	return hostedZones
}
