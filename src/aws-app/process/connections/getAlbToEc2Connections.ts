import {AwsResourcesList} from '@/types'
import {GroupedArns} from './groupArnsBasedOnType'
import {ProcessedConnections} from '../types'
import {getEC2Instances, getTargetGroups} from './utils'

export const getAlbToEc2Connections = (
	groupedArns: GroupedArns,
	resources: AwsResourcesList,
	targetHealthByTgArn: Record<string, {Id: string}[]>,
): ProcessedConnections => {
	const connections: ProcessedConnections = []
	const instances = getEC2Instances(groupedArns, resources)
	const targetGroups = getTargetGroups(groupedArns, resources)

	// Map each target group to its associated ALB(s) via TargetGroup.LoadBalancerArns.
	const tgToAlbMap: Record<string, string[]> = {}
	Object.values(targetGroups).forEach((tg) => {
		if (tg.TargetGroupArn && tg.LoadBalancerArns && tg.LoadBalancerArns.length > 0) {
			tgToAlbMap[tg.TargetGroupArn] = tg.LoadBalancerArns
		}
	})
	// Use the targetHealthByTgArn mapping (from DescribeTargetHealth) to link instance IDs.
	Object.entries(tgToAlbMap).forEach(([tgArn, albArns]) => {
		const targets = targetHealthByTgArn[tgArn] || []
		targets.forEach((target) => {
			const matchingInstanceArn = Object.keys(instances).find((instArn) => {
				const instance = instances[instArn]
				return instance.InstanceId === target.Id
			})
			if (matchingInstanceArn) {
				albArns.forEach((albArn) => {
					connections.push({
						from: albArn,
						to: matchingInstanceArn,
						type: 'ALB_TO_EC2',
					})
				})
			}
		})
	})
	return connections
}
