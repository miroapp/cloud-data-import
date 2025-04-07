import {AwsResourcesList} from '@/types'
import {GroupedArns} from './groupArnsBasedOnType'
import {AwsResourceDescriptionMap, AwsSupportedResources} from '@/definitions/supported-services'

import type * as CloudFront from '@aws-sdk/client-cloudfront'
import type * as EC2 from '@aws-sdk/client-ec2'
import type * as ELBv2 from '@aws-sdk/client-elastic-load-balancing-v2'
import type * as AutoScaling from '@aws-sdk/client-auto-scaling'

export const getAutoScalingGroups = (
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

export const getTargetGroups = (
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

export const getCloudFrontDistributions = (
	groupedArns: GroupedArns,
	resources: AwsResourcesList,
): AwsResourcesList<AwsSupportedResources.CLOUDFRONT_DISTRIBUTIONS> => {
	const arns = groupedArns['distribution']
	const dists: AwsResourcesList<AwsSupportedResources.CLOUDFRONT_DISTRIBUTIONS> = {}
	for (const arn of arns) {
		if (resources[arn]) {
			dists[arn] = resources[arn] as CloudFront.DistributionSummary
		}
	}
	return dists
}

export const getS3Buckets = (
	groupedArns: GroupedArns,
	resources: AwsResourcesList,
): AwsResourcesList<AwsSupportedResources.S3_BUCKETS> => {
	const arns = groupedArns['bucket']
	const buckets: AwsResourcesList<AwsSupportedResources.S3_BUCKETS> = {}
	for (const arn of arns) {
		if (resources[arn]) {
			buckets[arn] = resources[arn] as AwsResourceDescriptionMap[AwsSupportedResources.S3_BUCKETS]
		}
	}
	return buckets
}

export const getALBs = (
	groupedArns: GroupedArns,
	resources: AwsResourcesList,
): AwsResourcesList<AwsSupportedResources.ELBV2_LOAD_BALANCERS> => {
	const arns = groupedArns['loadbalancer']
	const albs: AwsResourcesList<AwsSupportedResources.ELBV2_LOAD_BALANCERS> = {}
	for (const arn of arns) {
		if (resources[arn]) {
			albs[arn] = resources[arn] as ELBv2.LoadBalancer
		}
	}
	return albs
}

export const getEC2Instances = (
	groupedArns: GroupedArns,
	resources: AwsResourcesList,
): AwsResourcesList<AwsSupportedResources.EC2_INSTANCES> => {
	const arns = groupedArns['instance']
	const instances: AwsResourcesList<AwsSupportedResources.EC2_INSTANCES> = {}
	for (const arn of arns) {
		if (resources[arn]) {
			instances[arn] = resources[arn] as EC2.Instance
		}
	}
	return instances
}

export const getHostedZones = (
	groupedArns: GroupedArns,
	resources: AwsResourcesList,
): AwsResourcesList<AwsSupportedResources.ROUTE53_HOSTED_ZONES> => {
	const arns = groupedArns['hostedzone']
	const zones: AwsResourcesList<AwsSupportedResources.ROUTE53_HOSTED_ZONES> = {}
	for (const arn of arns) {
		if (resources[arn]) {
			zones[arn] = resources[arn] as AwsResourceDescriptionMap[AwsSupportedResources.ROUTE53_HOSTED_ZONES]
		}
	}
	return zones
}
