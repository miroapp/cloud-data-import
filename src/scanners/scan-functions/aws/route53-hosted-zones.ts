import {
	Route53Client,
	ListHostedZonesCommand,
	GetHostedZoneCommand,
	ListResourceRecordSetsCommand,
} from '@aws-sdk/client-route-53'
import {AwsCredentials, RateLimiter, AwsResourcesList} from '@/types'
import {buildARN} from './common/buildArn'
import {getAwsAccountId} from './common/getAwsAccountId'
import {AwsSupportedResources} from '@/definitions/supported-services'
import type {RRType} from '@aws-sdk/client-route-53'

export async function getHostedZones(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
): Promise<AwsResourcesList<AwsSupportedResources.ROUTE53_HOSTED_ZONES>> {
	const client = new Route53Client({credentials})
	const accountId = await getAwsAccountId(credentials)
	const hostedZones: AwsResourcesList<AwsSupportedResources.ROUTE53_HOSTED_ZONES> = {}

	let marker: string | undefined
	do {
		const listHostedZonesCommand = new ListHostedZonesCommand({Marker: marker})
		const listHostedZonesResponse = await rateLimiter.throttle(() => client.send(listHostedZonesCommand))

		if (listHostedZonesResponse.HostedZones) {
			for (const hostedZone of listHostedZonesResponse.HostedZones) {
				if (!hostedZone.Id) {
					throw new Error('HostedZoneId is missing in the response')
				}

				const getHostedZoneCommand = new GetHostedZoneCommand({Id: hostedZone.Id})
				const getHostedZoneResponse = await rateLimiter.throttle(() => client.send(getHostedZoneCommand))

				if (getHostedZoneResponse.HostedZone) {
					const recordSets = []
					let nextRecordName: string | undefined = undefined
					let nextRecordType: RRType | undefined = undefined
					let nextRecordIdentifier: string | undefined = undefined
					do {
						const listRecordSetsCommand: ListResourceRecordSetsCommand = new ListResourceRecordSetsCommand({
							HostedZoneId: hostedZone.Id,
							StartRecordName: nextRecordName,
							StartRecordType: nextRecordType,
							StartRecordIdentifier: nextRecordIdentifier,
						})
						const listRecordSetsResponse = await rateLimiter.throttle(() => client.send(listRecordSetsCommand))
						if (listRecordSetsResponse.ResourceRecordSets) {
							recordSets.push(...listRecordSetsResponse.ResourceRecordSets)
						}
						nextRecordName = listRecordSetsResponse.NextRecordName
						nextRecordType = listRecordSetsResponse.NextRecordType
						nextRecordIdentifier = listRecordSetsResponse.NextRecordIdentifier
					} while (nextRecordName)

					const arn = buildARN({
						service: 'route53',
						region: '', // Route53 is global
						accountId: '', // Route53 ARNs don't include an account ID
						resource: `hostedzone/${hostedZone.Id.split('/').pop()}`,
					})
					hostedZones[arn] = {
						Account: accountId,
						...getHostedZoneResponse.HostedZone,
						RecordSets: recordSets,
					}
				}
			}
		}

		marker = listHostedZonesResponse.Marker
	} while (marker)

	return hostedZones
}
