#! /usr/bin/env node

import discoverAwsApp from './aws-app/scan-and-save-as-json'

const commands = process.argv.slice(2)

async function main() {
	// If a command is provided and it is not `aws`, print an error message
	const nonArguments = commands.filter((command) => !command.startsWith('--'))
	if (nonArguments.length > 0 && nonArguments[0] !== 'aws') {
		throw new Error(`Unknown command: ${nonArguments[0]}`)
	}

	// If no command is provided, or the command is `aws`, run the AWS app
	await discoverAwsApp()
}

main().catch((error) => {
	console.error(error)
	process.exit(1)
})
