import {AwsResourcesList} from '@/types'
import {ProcessedConnections} from '../types'
import {GroupedArns} from './groupArnsBasedOnType'
import {getAutoScalingGroups, getTargetGroups} from './utils'

export const getElbToAutoScalingConnections = (
	groupedArns: GroupedArns,
	resources: AwsResourcesList,
): ProcessedConnections => {
	const connections: ProcessedConnections = []

	const asgs = getAutoScalingGroups(groupedArns, resources)
	const targetGroups = getTargetGroups(groupedArns, resources)

	const tgToAsgMap: Record<string, string[]> = {}
	Object.values(asgs).forEach((asg) => {
		if (asg.TargetGroupARNs) {
			asg.TargetGroupARNs.forEach((tgArn: string) => {
				if (!tgToAsgMap[tgArn]) {
					tgToAsgMap[tgArn] = []
				}
				if (asg.AutoScalingGroupARN) tgToAsgMap[tgArn].push(asg.AutoScalingGroupARN)
			})
		}
	})

	Object.values(targetGroups).forEach((tg) => {
		const tgArn = tg.TargetGroupArn

		if (!tgArn) {
			return
		}

		// Check if this target group is attached to any ASG.
		if (tg.LoadBalancerArns && tg.LoadBalancerArns.length > 0 && tgToAsgMap[tgArn]) {
			tg.LoadBalancerArns.forEach((lbArn) => {
				tgToAsgMap[tgArn].forEach((asgArn) => {
					connections.push({
						from: lbArn,
						to: asgArn,
						type: 'ELB_TO_ASG',
					})
				})
			})
		}
	})

	return connections
}
