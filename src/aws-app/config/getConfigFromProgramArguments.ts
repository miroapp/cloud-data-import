import {AwsRegionId, Config} from '@/types'
import {awsRegionIds} from '@/definitions/supported-regions'
import {getDefaultOutputName} from './getDefaultOutputName'
import {SUPPORTED_ENV_VARS, getEnvConfig} from './getEnvConfig'
import {program} from './program'

export const getConfigFromProgramArguments = (): Config => {
	return program
		.option('regions', {
			alias: 'r',
			type: 'array',
			description: 'List of regions to scan (use "all" to scan all regions)',
			default: getEnvConfig(SUPPORTED_ENV_VARS.REGIONS)?.split(',') || undefined, // Load from env if set
			coerce: (arg: string[]) => {
				if (arg.filter(Boolean).length === 0) {
					const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION

					if (region) {
						const envVar = process.env.AWS_REGION ? 'AWS_REGION' : 'AWS_DEFAULT_REGION'
						console.log(`[INFO] Using the ${region} region provided by the ${envVar} environment variable\n`)
						return [region]
					}

					throw new Error('[ERROR] At least one region must be provided')
				}

				if (arg.includes('all')) {
					return awsRegionIds
				}

				const invalidRegions = arg.filter((region) => !awsRegionIds.includes(region as AwsRegionId))
				if (invalidRegions.length) {
					throw new Error(
						`[ERROR] Invalid region(s): ${invalidRegions.join(', ')}. Valid regions are: ${awsRegionIds.join(', ')}`,
					)
				}

				return arg
			},
		})
		.option('profile', {
			alias: 'p',
			type: 'string',
			description: 'Specify the AWS profile to use (takes priority over the AWS_PROFILE environment variable).',
			default: getEnvConfig(SUPPORTED_ENV_VARS.PROFILE) || process.env.AWS_PROFILE || undefined,
		})
		.option('output', {
			alias: 'o',
			type: 'string',
			description: 'Output file path (must be .json)',
			default: getEnvConfig(SUPPORTED_ENV_VARS.OUTPUT) || getDefaultOutputName(),
			coerce: (arg: string | string[]) => {
				if (Array.isArray(arg)) {
					arg = arg.filter(Boolean)[0] || ''
				}
				return arg
			},
		})
		.option('call-rate-rps', {
			alias: 'rps',
			type: 'number',
			description: 'Maximum number of API calls to make per second (per quota)',
			default: parseFloat(getEnvConfig(SUPPORTED_ENV_VARS.CALL_RATE_RPS) || '') || 10,
			coerce: (arg: number) => {
				if (arg <= 0) {
					throw new Error('[ERROR] Call rate must be >0')
				}
				return arg
			},
		})
		.option('compressed', {
			alias: 'c',
			type: 'boolean',
			description: 'Compress the output',
			default: getEnvConfig(SUPPORTED_ENV_VARS.COMPRESSED) === 'true',
		})
		.option('regional-only', {
			alias: 'ro',
			type: 'boolean',
			description: 'Only scan regional services and ignore global services',
			default: getEnvConfig(SUPPORTED_ENV_VARS.REGIONAL_ONLY) === 'true',
		})
		.option('raw', {
			type: 'boolean',
			description:
				'Output raw JSON without any transformations (this will be the only available option in the near-future)',
			default: false,
		})
		.option('open-output-dir', {
			alias: 'ood',
			type: 'boolean',
			description: 'Open the output directory after saving the file',
			default: false,
		})
		.help()
		.strict().argv as unknown as Config
}
