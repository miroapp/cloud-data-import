import 'dotenv/config'

const ENV_VAR_PREFIX = 'CLOUDVIEW_AWS_'

export enum SUPPORTED_ENV_VARS {
	REGIONS = 'REGIONS',
	PROFILE = 'PROFILE',
	OUTPUT = 'OUTPUT',
	CALL_RATE_RPS = 'CALL_RATE_RPS',
	COMPRESSED = 'COMPRESSED',
	REGIONAL_ONLY = 'REGIONAL_ONLY',
}

export function getEnvConfig(name: SUPPORTED_ENV_VARS): string | undefined {
	return process.env[`${ENV_VAR_PREFIX}${name.toUpperCase()}`]
}
