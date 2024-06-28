#! /usr/bin/env node

import discoverAwsApp from './aws-app/main'

const commands = process.argv.slice(2)

async function main() {
	// If a command is provided and it is not `aws`, print an error message
	const firstArgIndex = commands.findIndex((arg) => arg.startsWith('-'))
	const nonArguments = firstArgIndex === -1 ? commands : commands.slice(0, firstArgIndex)
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
