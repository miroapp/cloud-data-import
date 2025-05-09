import {AwsTags} from '@/types'

/**
 * Extracts unique tag keys and their possible values from AWS resource tags
 * @param resourceTags - Tags associated with AWS resources
 * @returns An object mapping tag keys to arrays of their unique values
 * @example
 * ```ts
 * const resourceTags = {
 *   'arn:aws:ec2:us-east-1:123456789012:instance/i-1234567890abcdef0': {
 *     'Environment': 'Production',
 *     'Project': 'Alpha'
 *   },
 *   'arn:aws:ec2:us-east-1:123456789012:instance/i-1234567890abcdef1': {
 *     'Environment': 'Production',
 *     'Project': 'Beta'
 *   }
 * }
 *
 * const tagKeysAndValues = extractUniqueTagKeysAndValues(resourceTags)
 *
 * // tagKeysAndValues = {
 * //   'Environment': ['Production'],
 * //   'Project': ['Alpha', 'Beta']
 * // }
 */
export const extractUniqueTagKeysAndValues = (resourceTags: AwsTags): Record<string, string[]> => {
	const tagKeyValueMap: Record<string, string[]> = {}

	for (const [_arn, tags] of Object.entries(resourceTags)) {
		for (const [key, value] of Object.entries(tags)) {
			if (!tagKeyValueMap[key]) {
				tagKeyValueMap[key] = []
			}

			if (value && !tagKeyValueMap[key].includes(value)) {
				tagKeyValueMap[key].push(value)
			}
		}
	}

	return tagKeyValueMap
}
