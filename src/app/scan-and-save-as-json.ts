import {config} from './args'
import {Logger} from './hooks/Logger'
import {getAwsScanners} from '../scanners'
import {StandardOutputSchema, ScannerError} from '../types'
import {saveAsJson} from './utils/saveAsJson'
import {NO_ASSUME_ROLE_ERROR, getCredentials} from './getCredentials'
import {RateLimiter} from '../scanners/common/RateLimiter'
import * as cliMessages from './cliMessages'
import path from 'path'

export const scanAndSaveAsJson = async () => {
	console.log(cliMessages.getIntro())

	// get STS credentials
	let credentials
	try {
		credentials = await getCredentials(config)
	} catch (error) {
		if ((error as Error).message === NO_ASSUME_ROLE_ERROR) {
			console.error(
				'\n[ERROR] No role is assumed! Please run `assume` command to assume a role before running this script!\n',
			)
			process.exit(1)
		}
		throw error
	}

	// prepare scanners
	const scanners = getAwsScanners({
		credentials,
		regions: config.regions,
		getRateLimiter: () => new RateLimiter(config['call-rate-rps']),
		shouldIncludeGlobalServices: !config['regional-only'],
		hooks: [
			new Logger(), // log scanning progress
		],
	})

	// run scanners
	const startedAt = new Date()
	const result = await Promise.all(scanners.map((scanner) => scanner()))
	const finishedAt = new Date()

	// calculate duration
	const duration = parseFloat(((finishedAt.getTime() - startedAt.getTime()) / 1000).toFixed(2))

	// aggregate resources
	const resources = result.reduce((acc, {resources}) => {
		return {...acc, ...resources}
	}, {})

	// aggregate errors
	const errors = result.reduce((acc, {errors}) => {
		return [...acc, ...errors]
	}, [] as ScannerError[])

	// create output
	const output: StandardOutputSchema = {
		provider: 'aws',
		docVersion: '0.0.1',
		resources,
		errors,
		metadata: {
			startedAt: startedAt.toISOString(),
			finishedAt: finishedAt.toISOString(),
		},
	}

	const pathname = path.join(process.cwd(), config.output)

	try {
		await saveAsJson(pathname, output, config.compressed)
	} catch (error) {
		console.error(`\n[ERROR] Failed to save output to ${config.output}\n`)
		throw error
	}

	console.log(
		cliMessages.getOutro({
			pathname,
			duration,
			count: Object.keys(resources).length,
		}),
	)
}
