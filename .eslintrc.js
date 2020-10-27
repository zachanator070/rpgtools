module.exports = {
	extends: ["alloy", "alloy/react", "alloy/typescript"],
	plugins: ["prettier", "jest"],
	env: {
		browser: true,
		jest: true,
		node: true,
	},
	rules: {
		"max-params": "off",
		radix: "off",
		"no-case-declarations": "off",
		"no-param-reassign": "off",
		"max-nested-callbacks": "off",
		"react/no-unescaped-entities": "off",
		"@typescript-eslint/no-require-imports": "off",
		"@typescript-eslint/prefer-optional-chain": "off",
		"@typescript-eslint/explicit-member-accessibility": "off",
		"@typescript-eslint/no-invalid-this": "off",
	},
};
