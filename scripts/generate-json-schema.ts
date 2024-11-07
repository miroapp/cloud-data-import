import {generateSchema, getConstValue, getExistingVersions, isHigherVersion, saveSchema} from './common/schema-utils'

try {
	const schema = generateSchema()
	const docVersion = getConstValue(schema, 'docVersion')

	// Validate docVersion format (e.g., '1.0.0')
	if (!/^\d+\.\d+\.\d+$/.test(docVersion)) {
		throw new Error(`Invalid docVersion format: "${docVersion}". Expected format is "X.Y.Z".`)
	}

	// Compare with existing schema versions
	const existingVersions = getExistingVersions()

	// If there are existing versions, ensure the new version is higher
	if (existingVersions.length > 0) {
		const isVersionHigher = existingVersions.every((version) => isHigherVersion(docVersion, version))

		if (!isVersionHigher) {
			throw new Error(
				`Error: docVersion "${docVersion}" is not higher than existing versions (${existingVersions.join(', ')}).`,
			)
		}
	}

	// Save the new schema
	saveSchema(schema, docVersion)

	console.log(`Schema version ${docVersion} generated successfully.`)
} catch (error) {
	console.error(`Error: ${(error as Error).message}`)
	process.exit(1)
}
