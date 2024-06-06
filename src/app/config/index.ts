import {getConfigFromProgramArguments} from './getConfigFromProgramArguments'

export const getConfig = async () => {
	const includesArgs = process.argv.find((arg) => arg.includes('--'))

	// If the user hasn't provided any options, we'll use GUI to get the configuration
	if (!includesArgs) {
		// @todo gui here
	}

	// Otherwise, we'll use the options provided by the user
	return getConfigFromProgramArguments()
}
