import * as TJS from 'typescript-json-schema'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

// Settings for the JSON schema generation
export const settings: TJS.PartialArgs = {
	required: true,
}

// Compiler options for TypeScript
export const compilerOptions = {
	strictNullChecks: true,
}

// Paths
export const root = path.resolve(__dirname, '../..')
export const typesFilePath = path.resolve(root, 'src/types.ts')
export const schemasDir = path.resolve(root, 'schemas')

// Function to generate the schema
export function generateSchema(): TJS.Definition {
	// Ensure types.ts exists
	if (!fs.existsSync(typesFilePath)) {
		throw new Error(
			'Error: src/types.ts file does not exist.\nPlease create src/types.ts and define the necessary types.',
		)
	}

	// Create a program from the TypeScript files
	const program = TJS.getProgramFromFiles([typesFilePath], compilerOptions)

	// Generate the schema for AwsStandardSchema
	const schema = TJS.generateSchema(program, 'AwsStandardSchema', settings)

	if (!schema) {
		throw new Error(
			'Error: Could not generate schema for AwsStandardSchema.\nEnsure that AwsStandardSchema is defined in src/types.ts.',
		)
	}

	return schema
}

// Function to extract constant values from the schema
export function getConstValue(schema: TJS.Definition, key: string): string {
	if (schema && typeof schema.properties?.[key] === 'object' && 'const' in schema.properties[key]) {
		return schema.properties[key].const as string
	}

	throw new Error(
		`In the schema, the key "${key}" is not defined as a constant. Make sure "${key}" is defined and has a constant value in the schema.`,
	)
}

// Function to compare two version strings
export function isHigherVersion(newVersion: string, existingVersion: string): boolean {
	const newParts = newVersion.split('.').map(Number)
	const existingParts = existingVersion.split('.').map(Number)

	for (let i = 0; i < newParts.length; i++) {
		if (newParts[i] > existingParts[i]) return true // New version is higher
		if (newParts[i] < existingParts[i]) return false // New version is lower
	}
	return false // Versions are equal
}

// Function to get existing schema versions
export function getExistingVersions(): string[] {
	if (!fs.existsSync(schemasDir)) {
		return []
	}

	return fs
		.readdirSync(schemasDir)
		.filter((file) => /^miro-cloudview-aws-v\d+\.\d+\.\d+\.json$/.test(file))
		.map((file) => file.match(/^miro-cloudview-aws-v(\d+\.\d+\.\d+)\.json$/)![1])
}

// Function to save the schema
export function saveSchema(schema: TJS.Definition, docVersion: string) {
	const fileName = `miro-cloudview-aws-v${docVersion}.json`
	const outputPath = path.resolve(schemasDir, fileName)

	// Ensure schemas directory exists
	if (!fs.existsSync(schemasDir)) {
		fs.mkdirSync(schemasDir, {recursive: true})
	}

	fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2))

	// Update the 'miro-cloudview-aws-latest.json' symlink
	const latestLinkName = 'miro-cloudview-aws-latest.json'
	const latestPath = path.resolve(schemasDir, latestLinkName)

	// Remove existing symlink if it exists
	if (fs.existsSync(latestPath)) {
		fs.unlinkSync(latestPath)
	}

	// Create a new symlink pointing to the latest versioned schema file
	fs.symlinkSync(fileName, latestPath)

	console.log(`Saved schema as ${fileName} and updated symlink ${latestLinkName}`)
}

// Function to hash an object
export function hashObject(obj: any): string {
	return crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex')
}

// Function to get the schema file path for a given version
export function getSchemaFilePath(docVersion: string): string {
	const fileName = `miro-cloudview-aws-v${docVersion}.json`
	return path.resolve(schemasDir, fileName)
}
