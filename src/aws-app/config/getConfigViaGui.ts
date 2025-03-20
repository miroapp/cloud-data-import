import inquirer from 'inquirer'
import {Config} from '@/types'
import {awsRegionIds} from '@/definitions/supported-regions'
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

const profilePrompt = async (defaultProfile?: string): Promise<string | undefined> => {
	const {profile} = await inquirer.prompt([
		{
			type: 'input',
			name: 'profile',
			message: 'AWS profile:',
			default: defaultProfile,
		},
	])
	return profile
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
			message: 'Scan global resources?',
			default: defaultScanGlobal,
		},
	])
	return scanGlobal
}

export const getDefaultConfigValues = (): {
	output: string
	regions: any
	profile: string | undefined
	regionalOnly: boolean
	callRate: number
	compressed: boolean
} => {
	const regions = getEnvConfig(SUPPORTED_ENV_VARS.REGIONS)?.split(',')
	const profile = getEnvConfig(SUPPORTED_ENV_VARS.PROFILE) || process.env.AWS_PROFILE || undefined
	const regionalOnly = getEnvConfig(SUPPORTED_ENV_VARS.REGIONAL_ONLY) === 'true'
	const output = getEnvConfig(SUPPORTED_ENV_VARS.OUTPUT) || getDefaultOutputName()
	const callRate = parseInt(getEnvConfig(SUPPORTED_ENV_VARS.CALL_RATE_RPS) || '') || 10
	const compressed = getEnvConfig(SUPPORTED_ENV_VARS.COMPRESSED) === 'true'

	return {
		regions,
		profile,
		regionalOnly,
		output,
		callRate,
		compressed,
	}
}

export const getConfigViaGui = async (): Promise<Config> => {
	const defaults = getDefaultConfigValues()

	const regions = await regionPrompt(defaults.regions)
	const profile = await profilePrompt(defaults.profile)
	const scanGlobal = await scanGlobalPrompt(!defaults.regionalOnly)
	const output = await outputPathPrompt(defaults.output)
	const callRateRps = await callRatePrompt(defaults.callRate)
	const compressed = await compressedPrompt(defaults.compressed)

	return {
		regions,
		profile,
		output,
		'call-rate-rps': callRateRps,
		compressed,
		raw: false,
		'open-output-dir': true,
		'regional-only': !scanGlobal,
	}
}
