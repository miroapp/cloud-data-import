import {CloudFrontClient, ListDistributionsCommand} from '@aws-sdk/client-cloudfront'
import {AwsCredentials, AwsResourcesList, RateLimiter} from '@/types'
import {AwsSupportedResources} from '@/definitions/supported-services'

export async function getCloudFrontDistributions(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
): Promise<AwsResourcesList<AwsSupportedResources.CLOUDFRONT_DISTRIBUTIONS>> {
	const client = new CloudFrontClient({credentials})

	const distributions: AwsResourcesList<AwsSupportedResources.CLOUDFRONT_DISTRIBUTIONS> = {}

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
