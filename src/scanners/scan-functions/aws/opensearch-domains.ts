import {
	OpenSearchClient,
	ListDomainNamesCommand,
	DescribeDomainsCommand,
	DescribeDomainCommand,
} from '@aws-sdk/client-opensearch'
import {AwsCredentials, AwsResourcesList, RateLimiter} from '@/types'
import {AwsSupportedResources} from '@/definitions/supported-services'

const MAX_DOMAINS_PER_REQUEST = 5

export async function getOpenSearchDomains(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResourcesList<AwsSupportedResources.OPENSEARCH_DOMAINS>> {
	const client = new OpenSearchClient({credentials, region})

	const resources: AwsResourcesList<AwsSupportedResources.OPENSEARCH_DOMAINS> = {}

	const listDomainNamesCommand = new ListDomainNamesCommand()
	const listDomainNamesResponse = await rateLimiter.throttle(() => client.send(listDomainNamesCommand))
	const domainNames = (listDomainNamesResponse.DomainNames || [])
		.map((domain) => domain.DomainName)
		.filter((domain) => domain !== undefined)

	const domainChunks = splitDomainsIntoChunks(domainNames)
	for (const chunk of domainChunks) {
		const describeDomainsCommand = new DescribeDomainsCommand({
			DomainNames: chunk,
		})

		const describeDomainsResponse = await rateLimiter.throttle(() => client.send(describeDomainsCommand))

		if (describeDomainsResponse.DomainStatusList) {
			for (const domain of describeDomainsResponse.DomainStatusList) {
				if (domain.ARN) {
					resources[domain.ARN] = domain
				}
			}
		}
	}

	return resources
}

function splitDomainsIntoChunks(domains: string[]): string[][] {
	const chunks: string[][] = []
	for (let i = 0; i < domains.length; i += MAX_DOMAINS_PER_REQUEST) {
		chunks.push(domains.slice(i, i + MAX_DOMAINS_PER_REQUEST))
	}

	return chunks
}
