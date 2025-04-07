import {AwsResourcesList} from '@/types'
import {GroupedArns} from './groupArnsBasedOnType'
import {ProcessedConnections} from '../types'
import {getHostedZones, getS3Buckets} from './utils'

export const getRoute53ToS3Connections = (
	groupedArns: GroupedArns,
	resources: AwsResourcesList,
): ProcessedConnections => {
	const connections: ProcessedConnections = []
	const zones = getHostedZones(groupedArns, resources)
	const buckets = getS3Buckets(groupedArns, resources)
	Object.entries(zones).forEach(([zoneArn, zone]) => {
		const recordSets = zone.RecordSets || []
		recordSets.forEach((record) => {
			if (record.AliasTarget && record.AliasTarget.DNSName) {
				const aliasDNS = record.AliasTarget.DNSName
				Object.entries(buckets).forEach(([bucketArn, bucket]) => {
					// Assume the S3 bucket name is part of the alias DNS.
					if (bucket.Name && aliasDNS.includes(bucket.Name)) {
						connections.push({
							from: zoneArn,
							to: bucketArn,
							type: 'ROUTE53_TO_S3',
						})
					}
				})
			}
		})
	})
	return connections
}
