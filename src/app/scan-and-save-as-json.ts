import path from 'path'
import {Logger} from './hooks/Logger'
import {getAwsScanners, createRateLimiter} from '@/scanners'
import {StandardOutputSchema, ScannerError} from '@/types'
import {saveAsJson} from './utils/saveAsJson'
import * as cliMessages from './cliMessages'
import {openDirectoryAndFocusFile} from './utils/openDirectoryAndFocusFile'
import {transformJSONForVisualization} from './visualization/transformJSON'
import {getConfig} from './config'

export const scanAndSaveAsJson = async () => {
	console.log(cliMessages.getIntro())

	const config = await getConfig()

	// prepare scanners
	const scanners = getAwsScanners({
		credentials: undefined, // assume that the credentials are already set in the environment
		regions: config.regions,
		getRateLimiter: () => createRateLimiter(config['call-rate-rps']),
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

	const tranformedOutput = await transformJSONForVisualization(output)

	const pathname = path.join(process.cwd(), config.output)

	// save output to a file
	try {
		await saveAsJson(pathname, tranformedOutput, config.compressed)
	} catch (error) {
		console.error(`\n[ERROR] Failed to save output to ${config.output}\n`)
		throw error
	}

	// open the output directory and focus on the generated file
	try {
		await openDirectoryAndFocusFile(pathname)
	} catch (error) {
		// ignore
	}

	console.log(
		cliMessages.getOutro({
			pathname,
			duration,
			count: Object.keys(resources).length,
		}),
	)
}
