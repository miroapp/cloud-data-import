import {parse} from '@aws-sdk/util-arn-parser'

// Handling exceptional cases when the type is not as easy to extract from the ARN
const getType = (service: string, resource: string): string => {
	if (service === 'sns') return 'topic'
	if (service === 'sqs') return 'queue'
	return resource.split('/')[0].split(':')[0]
}

// Extract the resource name from the ARN
const getName = (resourceFullName: string, resourceType: string): string => {
	if (resourceFullName.startsWith(resourceType)) {
		// remove the resource type and one more character (usually a colon or a slash)
		return resourceFullName.slice(resourceType.length + 1)
	}
	return resourceFullName
}

export type ARNInfo = {
	name: string
	account: string
	service: string
	resource: string
	type: string
	region: string
	partition: string
}

export const getArnInfo = (arn: string): ARNInfo => {
	const arnData = parse(arn)

	if (!arnData) throw new Error('No ARN data found for the provided ARN.')

	const type = getType(arnData.service, arnData.resource)
	const name = getName(arnData.resource, type)

	return {
		name,
		account: arnData.accountId,
		service: arnData.service,
		type,
		resource: arnData.resource,
		region: arnData.region,
		partition: arnData.partition,
	}
}
