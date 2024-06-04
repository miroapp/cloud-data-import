import yargs from 'yargs'
import {hideBin} from 'yargs/helpers'
import {Config} from '@/types'
import {awsRegionIds} from '@/constants'
import {getDefaultOutputName} from './utils/getDefaultOutputName'

export const config = yargs(hideBin(process.argv))
	.option('regions', {
		alias: 'r',
		type: 'array',
		description: 'List of regions to scan (use "all" to scan all regions)',
		demandOption: true,
		coerce: (arg: string[]) => {
			if (arg.includes('all')) {
				return awsRegionIds
			}

			const invalidRegions = arg.filter((region) => !awsRegionIds.includes(region))
			if (invalidRegions.length) {
				throw new Error(
					`Invalid region(s): ${invalidRegions.join(', ')}. Valid regions are: ${awsRegionIds.join(', ')}`,
				)
			}

			return arg
		},
	})
	.option('output', {
		alias: 'o',
		type: 'string',
		description: 'Output file path (must be .json)',
		default: getDefaultOutputName(),
		coerce: (arg: string | string[]) => {
			if (Array.isArray(arg)) {
				arg = arg.filter(Boolean)[0] || ''
			}
			if (!arg.endsWith('.json')) {
				throw new Error('Output file must have a .json extension')
			}
			return arg
		},
	})
	.option('call-rate-rps', {
		alias: 'rps',
		type: 'number',
		description: 'Maximum number of API calls to make per second (per quota)',
		default: 10,
	})
	.option('compressed', {
		alias: 'c',
		type: 'boolean',
		description: 'Compress the output',
		default: false,
	})
	.option('regional-only', {
		alias: 'ro',
		type: 'boolean',
		description: 'Only scan regional services and ignore global services',
		default: false,
	})
	.strict().argv as unknown as Config
