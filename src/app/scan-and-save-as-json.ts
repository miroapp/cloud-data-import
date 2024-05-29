import {config} from './args'
import {Logger} from './hooks/Logger'
import {getAwsScanners} from '../scanners'
import {StandardOutputSchema, ScannerError, Config} from '../types'
import {saveAsJson} from './utils/saveAsJson'
import {NO_ASSUME_ROLE_ERROR, getCredentials} from './getCredentials'

export const scanAndSaveAsJson = async () => {
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
	const shouldIncludeGlobalServices = !config['regional-only']
	const scanners = getAwsScanners(credentials, config.regions, shouldIncludeGlobalServices, [
		new Logger(), // log scanning progress
	])

	// run scanners
	const startedAt = new Date().toISOString()
	const result = await Promise.all(scanners.map((scanner) => scanner()))
	const finishedAt = new Date().toISOString()

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
			startedAt,
			finishedAt,
		},
	}

	saveAsJson(config.output, output, config.compressed)
}
