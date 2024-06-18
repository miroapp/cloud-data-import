import inquirer from 'inquirer'
import {Config} from '@/types'
import {awsRegionIds} from '@/constants'
import {getDefaultOutputName} from './getDefaultOutputName'
import {SUPPORTED_ENV_VARS, getEnvConfig} from './getEnvConfig'

const regionPrompt = async (defaultRegions?: string[]): Promise<string[]> => {
	const {regions} = await inquirer.prompt([
		{
			type: 'checkbox',
			name: 'regions',
			message: 'Select regions to scan (space to select):',
			choices: [...awsRegionIds.map((region) => ({name: region, value: region}))],
			default: defaultRegions,
			validate: (input: string[]) => input.length > 0 || 'At least one region must be selected',
		},
	])
	return regions.includes('all') ? awsRegionIds : regions
}

const outputPathPrompt = async (defaultPath: string): Promise<string> => {
	const {output} = await inquirer.prompt([
		{
			type: 'input',
			name: 'output',
			message: 'Output file path (.json):',
			default: defaultPath,
		},
	])
	return output
}

const callRatePrompt = async (defaultRPS: number): Promise<number> => {
	const {rate} = await inquirer.prompt([
		{
			type: 'number',
			name: 'rate',
			message: 'Maximum API calls per second (per quota):',
			default: defaultRPS,
			validate: (input: number) => input > 0 || 'Call rate must be greater than 0',
		},
	])
	return rate
}

const compressedPrompt = async (defaultCompressed: boolean): Promise<boolean> => {
	const {compressed} = await inquirer.prompt([
		{
			type: 'confirm',
			name: 'compressed',
			message: 'Compress the output file?',
			default: defaultCompressed,
		},
	])
	return compressed
}

const scanGlobalPrompt = async (defaultScanGlobal: boolean): Promise<boolean> => {
	const {scanGlobal} = await inquirer.prompt([
		{
			type: 'confirm',
			name: 'scanGlobal',
			message: 'Should we also scan global resources?',
			default: defaultScanGlobal,
		},
	])
	return scanGlobal
}

export const getConfigViaGui = async (): Promise<Config> => {
	const defaultRegions = getEnvConfig(SUPPORTED_ENV_VARS.REGIONS)?.split(',')
	const defaultRegionalOnly = getEnvConfig(SUPPORTED_ENV_VARS.REGIONAL_ONLY) === 'true'
	const defaultOutput = getEnvConfig(SUPPORTED_ENV_VARS.OUTPUT) || getDefaultOutputName()
	const defaultCallRate = parseInt(getEnvConfig(SUPPORTED_ENV_VARS.CALL_RATE_RPS) || '') || 10
	const defaultCompressed = getEnvConfig(SUPPORTED_ENV_VARS.COMPRESSED) === 'true'

	const regions = await regionPrompt(defaultRegions)
	const scanGlobal = await scanGlobalPrompt(!defaultRegionalOnly)
	const output = await outputPathPrompt(defaultOutput)
	const callRateRps = await callRatePrompt(defaultCallRate)
	const compressed = await compressedPrompt(defaultCompressed)

	return {
		regions,
		output,
		'call-rate-rps': callRateRps,
		compressed,
		'regional-only': !scanGlobal,
	}
}
