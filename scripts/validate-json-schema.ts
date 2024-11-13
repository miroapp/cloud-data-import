import {generateSchema, getConstValue, hashObject, getSchemaFilePath} from './common/schema-utils'
import * as fs from 'fs'

try {
	const schema = generateSchema()
	const docVersion = getConstValue(schema, 'docVersion')
	const schemaPath = getSchemaFilePath(docVersion)

	if (!fs.existsSync(schemaPath)) {
		throw new Error(
			`AwsStandardSchema has been updated in src/types.ts but you haven't generated any new json-schemas.\n` +
				`Please run 'npm run generate-schema' to generate the schema files.`,
		)
	}

	const existingSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))

	// Compare hashes
	const newSchemaHash = hashObject(schema)
	const existingSchemaHash = hashObject(existingSchema)

	if (newSchemaHash !== existingSchemaHash) {
		throw new Error(
			'Error: The generated schema does not match the committed schema.\nPlease run "npm run generate-json-schema" and commit the changes.',
		)
	}

	console.log('Schema is up to date.')
} catch (error) {
	console.error(`Error: ${(error as Error).message}`)
	process.exit(1)
}
