module.exports = function (api) {
	api.cache(true);
	return {
		presets: ["@babel/preset-env"],
		env: {
			test: {
				presets: [
					[
						"@babel/preset-env",
						{
							targets: {
								node: "current",
							},
						},
					],
				],
				plugins: [
					"transform-es2015-modules-commonjs",
					"babel-plugin-dynamic-import-node",
				],
			},
		},
	};
};
