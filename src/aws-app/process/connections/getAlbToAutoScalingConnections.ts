import {AwsResourcesList, Connection} from '@/types'
import {ProcessedConnections} from '../types'
import {GroupedArns} from './groupArnsBasedOnType'
import {AwsSupportedResources} from '@/definitions/supported-services'
import type * as ELBv2 from '@aws-sdk/client-elastic-load-balancing-v2'
import type * as AutoScaling from '@aws-sdk/client-auto-scaling'

const getAutoScalingGroups = (
	groupedArns: GroupedArns,
	resources: AwsResourcesList,
): AwsResourcesList<AwsSupportedResources.AUTOSCALING_GROUPS> => {
	const arns = groupedArns['autoScalingGroup']

	const autoScalingGroups: AwsResourcesList<AwsSupportedResources.AUTOSCALING_GROUPS> = {}

	for (const arn of arns) {
		if (resources[arn]) {
			autoScalingGroups[arn] = resources[arn] as AutoScaling.AutoScalingGroup
		}
	}

	return autoScalingGroups
}

const getTargetGroups = (
	groupedArns: GroupedArns,
	resources: AwsResourcesList,
): AwsResourcesList<AwsSupportedResources.ELBV2_TARGET_GROUPS> => {
	const arns = groupedArns['targetgroup']
	const targetGroups: AwsResourcesList<AwsSupportedResources.ELBV2_TARGET_GROUPS> = {}

	for (const arn of arns) {
		if (resources[arn]) {
			targetGroups[arn] = resources[arn] as ELBv2.TargetGroup
		}
	}
	return targetGroups
}

export const getAlbToAutoScalingConnections = (
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
						type: 'ALB_TO_ASG',
					})
				})
			})
		}
	})

	return connections
}
