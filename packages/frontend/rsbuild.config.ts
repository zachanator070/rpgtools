import path from "node:path";

import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import CompressionPlugin from "compression-webpack-plugin";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";

export default defineConfig({
	plugins: [pluginReact({ fastRefresh: false })],
	dev: {
		hmr: false,
	},
	source: {
		entry: {
			index: "./src/index.tsx",
		},
	},
	html: {
		title: "RPG Tools",
		template: "./src/index.html",
		favicon: "./src/favicon.ico",
	},
	output: {
		distPath: {
			// need to output in the server package so electron app is packaged with UI bundle
			root: path.resolve(__dirname, "../server/dist/frontend"),
		},
		assetPrefix: "/",
		cleanDistPath: true,
	},
	tools: {
		rspack: (_, { appendPlugins }) => {
			const plugins = [
				new CompressionPlugin({
					filename: "[file].gz",
					algorithm: "gzip",
					test: /\.js$|\.css$|\.html$/,
					threshold: 10240,
					minRatio: 0.8,
				}),
			];

			if (process.env.BUILD_WITH_STATS === "true") {
				plugins.push(
					new BundleAnalyzerPlugin({
						analyzerMode: "static",
						reportFilename: "statistics.html",
						openAnalyzer: false,
						generateStatsFile: true,
						statsFilename: "stats.json",
					}),
				);
			}

			appendPlugins(plugins);
		},
	},
});
