import {AwsResourcesList} from '@/types'
import {GroupedArns} from './groupArnsBasedOnType'
import {ProcessedConnections} from '../types'
import {getCloudFrontDistributions, getHostedZones} from './utils'

export const getRoute53ToCloudFrontConnections = (
	groupedArns: GroupedArns,
	resources: AwsResourcesList,
): ProcessedConnections => {
	const connections: ProcessedConnections = []
	const zones = getHostedZones(groupedArns, resources)
	const dists = getCloudFrontDistributions(groupedArns, resources)
	Object.entries(zones).forEach(([zoneArn, zone]) => {
		const recordSets = zone.RecordSets || []
		recordSets.forEach((record) => {
			if (record.AliasTarget && record.AliasTarget.DNSName) {
				const aliasDNS = record.AliasTarget.DNSName
				Object.entries(dists).forEach(([distArn, dist]) => {
					// Compare with CloudFront distribution DomainName.
					if (dist.DomainName && aliasDNS.includes(dist.DomainName)) {
						connections.push({
							from: zoneArn,
							to: distArn,
							type: 'ROUTE53_TO_CLOUDFRONT',
						})
					}
				})
			}
		})
	})
	return connections
}
