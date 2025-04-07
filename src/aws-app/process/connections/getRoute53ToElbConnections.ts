import {AwsResourcesList} from '@/types'
import {GroupedArns} from './groupArnsBasedOnType'
import {ProcessedConnections} from '../types'
import {getALBs, getHostedZones} from './utils'

export const getRoute53ToElbConnections = (
	groupedArns: GroupedArns,
	resources: AwsResourcesList,
): ProcessedConnections => {
	const connections: ProcessedConnections = []
	const zones = getHostedZones(groupedArns, resources)
	const albs = getALBs(groupedArns, resources)
	// Assume each hosted zone resource contains a RecordSets array with records having an AliasTarget.
	Object.entries(zones).forEach(([zoneArn, zone]) => {
		const recordSets = zone.RecordSets || []
		recordSets.forEach((record) => {
			if (record.AliasTarget && record.AliasTarget.DNSName) {
				const aliasDNS = record.AliasTarget.DNSName
				Object.entries(albs).forEach(([albArn, alb]) => {
					// Compare with the ALB's DNSName.
					if (alb.DNSName && aliasDNS.includes(alb.DNSName)) {
						connections.push({
							from: zoneArn,
							to: albArn,
							type: 'ROUTE53_TO_ELB',
						})
					}
				})
			}
		})
	})
	return connections
}
