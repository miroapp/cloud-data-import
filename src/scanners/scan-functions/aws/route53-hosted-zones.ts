import {Route53Client, ListHostedZonesCommand, GetHostedZoneCommand, HostedZone} from '@aws-sdk/client-route-53'
import {Credentials, Resources} from '@/types'
import {RateLimiter} from '@/scanners/common/RateLimiter'
import {buildARN} from './common/buildArn'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getHostedZones(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<HostedZone>> {
	const client = new Route53Client({credentials, region})

	const accountId = await getAwsAccountId(credentials)

	const hostedZones: Resources<HostedZone> = {}

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
						region,
						accountId,
						resource: `hostedzone:${hostedZone.Id.split('/').pop()}`,
					})
					hostedZones[arn] = getHostedZoneResponse.HostedZone
				}
			}
		}

		marker = listHostedZonesResponse.Marker
	} while (marker)

	return hostedZones
}
