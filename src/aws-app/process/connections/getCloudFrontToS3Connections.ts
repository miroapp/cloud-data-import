import {AwsResourcesList} from '@/types'
import {GroupedArns} from './groupArnsBasedOnType'
import {ProcessedConnections} from '../types'
import {getCloudFrontDistributions, getS3Buckets} from './utils'

export const getCloudFrontToS3Connections = (
	groupedArns: GroupedArns,
	resources: AwsResourcesList,
): ProcessedConnections => {
	const connections: ProcessedConnections = []
	const distribution = getCloudFrontDistributions(groupedArns, resources)
	const buckets = getS3Buckets(groupedArns, resources)
	// For each distribution, check its Origins for a DomainName that includes a bucket name.
	Object.entries(distribution).forEach(([distArn, dist]) => {
		const origins = dist.Origins?.Items || []
		origins.forEach((origin) => {
			const domainName = origin.DomainName
			Object.entries(buckets).forEach(([bucketArn, bucket]) => {
				// Assuming the bucket object has a Name property and its website endpoint/domain is derivable.
				if (bucket.Name && domainName && domainName.includes(bucket.Name)) {
					connections.push({
						from: distArn,
						to: bucketArn,
						type: 'CLOUDFRONT_TO_S3',
					})
				}
			})
		})
	})
	return connections
}
