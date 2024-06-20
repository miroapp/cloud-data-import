const {ESLint} = require('eslint')

const config = new ESLint({
	baseConfig: {
		env: {
			es2021: true,
			node: true,
		},
		extends: ['eslint:recommended', 'prettier', 'plugin:prettier/recommended'],
		parserOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
		},
		plugins: ['prettier'],
		rules: {
			'prettier/prettier': 'error',
		},
	},
})

module.exports = config
