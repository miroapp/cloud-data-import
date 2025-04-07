import {AwsResourcesList} from '@/types'
import {GroupedArns} from './groupArnsBasedOnType'
import {AwsResourceDescriptionMap, AwsSupportedResources} from '@/definitions/supported-services'

import type * as CloudFront from '@aws-sdk/client-cloudfront'
import type * as ELBv2 from '@aws-sdk/client-elastic-load-balancing-v2'
import type * as EC2 from '@aws-sdk/client-ec2'

export const getCloudFrontDistributions = (
	groupedArns: GroupedArns,
	resources: AwsResourcesList,
): AwsResourcesList<AwsSupportedResources.CLOUDFRONT_DISTRIBUTIONS> => {
	const arns = groupedArns['cloudfront']
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
	const arns = groupedArns['s3']
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
	const arns = groupedArns['alb'] // or use 'elb' per your grouping
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
	const arns = groupedArns['ec2']
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
