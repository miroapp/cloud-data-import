import {getConfigFromProgramArguments} from './getConfigFromProgramArguments'
import {getConfigViaGui} from './getConfigViaGui'

export const getConfig = async () => {
	const includesArgs = process.argv.find((arg) => arg.includes('--'))

	// If the user hasn't provided any options, we'll use GUI to get the configuration
	if (!includesArgs) {
		return await getConfigViaGui()
	}

	// Otherwise, we'll use the options provided by the user
	return getConfigFromProgramArguments()
}
