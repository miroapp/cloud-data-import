import {CloudFrontClient, ListDistributionsCommand, DistributionSummary} from '@aws-sdk/client-cloudfront'
import {Credentials, Resources, RateLimiter} from '@/types'

export async function getCloudFrontDistributions(
	credentials: Credentials,
	rateLimiter: RateLimiter,
): Promise<Resources<DistributionSummary>> {
	const client = new CloudFrontClient({credentials})

	const distributions: Resources<DistributionSummary> = {}

	let marker: string | undefined
	do {
		const listDistributionsCommand = new ListDistributionsCommand({
			Marker: marker,
		})

		const listDistributionsResponse = await rateLimiter.throttle(() => client.send(listDistributionsCommand))

		if (listDistributionsResponse.DistributionList?.Items) {
			for (const distribution of listDistributionsResponse.DistributionList.Items) {
				if (!distribution.ARN) {
					throw new Error('Distribution ARN is missing in the response')
				}

				distributions[distribution.ARN] = distribution
			}
		}

		marker = listDistributionsResponse.DistributionList?.NextMarker
	} while (marker)

	return distributions
}
