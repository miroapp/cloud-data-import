import path from 'path'
import {Logger} from './hooks/Logger'
import {getAwsScanners} from '@/scanners'
import {StandardOutputSchema, ScannerError} from '@/types'
import {saveAsJson} from './utils/saveAsJson'
import * as cliMessages from './cliMessages'
import {openDirectoryAndFocusFile} from './utils/openDirectoryAndFocusFile'
import {getProcessedData} from './process'
import {getConfig} from './config'
import {createRateLimiterFactory} from './utils/createRateLimiterFactory'
import {getAwsAccountId} from '@/scanners/scan-functions/aws/common/getAwsAccountId'
import {AWSRateLimitExhaustionRetryStrategy} from './utils/AWSRateLimitExhaustionRetryStrategy'

export default async () => {
	console.log(cliMessages.getIntro())

	const config = await getConfig()

	// setting the AWS_REGION explicitly to meet SDK requirements
	process.env.AWS_REGION = config.regions[0]

	// set the profile explicitly if provided
	if (config.profile !== undefined) {
		process.env.AWS_PROFILE = config.profile
	}

	const getRateLimiter = createRateLimiterFactory(config['call-rate-rps'], new AWSRateLimitExhaustionRetryStrategy())

	const credentials = undefined

	// prepare scanners
	const scanners = getAwsScanners({
		credentials,
		regions: config.regions,
		getRateLimiter,
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

	// aggregate tags
	const tags = result.reduce((acc, {tags}) => {
		return {...acc, ...tags}
	}, {})

	// aggregate errors
	const errors = result.reduce((acc, {errors}) => {
		return [...acc, ...errors]
	}, [] as ScannerError[])

	// create output
	const output: StandardOutputSchema = {
		provider: 'aws',
		docVersion: '0.1.0',
		resources: config.raw ? resources : {},
		tags: config.raw ? tags : {},
		processed: await getProcessedData(resources, tags),
		errors,
		metadata: {
			account: await getAwsAccountId(credentials),
			regions: config.regions,
			startedAt: startedAt.toISOString(),
			finishedAt: finishedAt.toISOString(),
		},
	}

	const pathname = path.resolve(process.cwd(), config.output)

	// save output to a file
	try {
		await saveAsJson(pathname, output, config.compressed)
	} catch (error) {
		console.error(`\n[ERROR] Failed to save output to ${config.output}\n`)
		throw error
	}

	// open the output directory and focus on the generated file
	if (config['open-output-dir']) {
		try {
			await openDirectoryAndFocusFile(pathname)
		} catch (error) {
			// ignore
		}
	}

	console.log(
		cliMessages.getOutro({
			pathname,
			duration,
			count: Object.keys(resources).length,
		}),
	)
}
