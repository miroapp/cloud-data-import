import 'dotenv/config'
import yargs from 'yargs'
import {hideBin} from 'yargs/helpers'
import {Config} from '@/types'
import {awsRegionIds} from '@/constants'
import {getDefaultOutputName} from './utils/getDefaultOutputName'

function getEnvVar(name: string): string | undefined {
	return process.env[`CLOUDVIEW_AWS_${name.toUpperCase()}`]
}

export const config = yargs(hideBin(process.argv))
	.option('regions', {
		alias: 'r',
		type: 'array',
		description: 'List of regions to scan (use "all" to scan all regions)',
		default: getEnvVar('REGIONS')?.split(',') || undefined, // Load from env if set
		coerce: (arg: string[]) => {
			if (arg.filter(Boolean).length === 0) {
				throw new Error('[ERROR] At least one region must be provided')
			}

			if (arg.includes('all')) {
				return awsRegionIds
			}

			const invalidRegions = arg.filter((region) => !awsRegionIds.includes(region))
			if (invalidRegions.length) {
				throw new Error(
					`[ERROR] Invalid region(s): ${invalidRegions.join(', ')}. Valid regions are: ${awsRegionIds.join(', ')}`,
				)
			}

			return arg
		},
	})
	.option('output', {
		alias: 'o',
		type: 'string',
		description: 'Output file path (must be .json)',
		default: getEnvVar('OUTPUT') || getDefaultOutputName(),
		coerce: (arg: string | string[]) => {
			if (Array.isArray(arg)) {
				arg = arg.filter(Boolean)[0] || ''
			}
			if (!arg.endsWith('.json')) {
				throw new Error('[ERROR] Output file must have a .json extension')
			}
			return arg
		},
	})
	.option('call-rate-rps', {
		alias: 'rps',
		type: 'number',
		description: 'Maximum number of API calls to make per second (per quota)',
		default: parseFloat(getEnvVar('CALL_RATE_RPS') || '') || 10,
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
		default: getEnvVar('COMPRESSED') === 'true',
	})
	.option('regional-only', {
		alias: 'ro',
		type: 'boolean',
		description: 'Only scan regional services and ignore global services',
		default: getEnvVar('REGIONAL_ONLY') === 'true',
	})
	.strict().argv as unknown as Config
