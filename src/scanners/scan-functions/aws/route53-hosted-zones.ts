import {Route53Client, ListHostedZonesCommand, GetHostedZoneCommand} from '@aws-sdk/client-route-53'
import {Credentials, Resources, RateLimiter, EnrichedHostedZone} from '@/types'
import {buildARN} from './common/buildArn'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getHostedZones(
	credentials: Credentials,
	rateLimiter: RateLimiter,
): Promise<Resources<EnrichedHostedZone>> {
	const client = new Route53Client({credentials})

	const accountId = await getAwsAccountId(credentials)

	const hostedZones: Resources<EnrichedHostedZone> = {}

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
