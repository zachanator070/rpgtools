import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import webpack from "webpack";
import StatsPlugin from "stats-webpack-plugin";
import Visualizer from "webpack-visualizer-plugin";
import CompressionPlugin from "compression-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import * as url from 'url';

console.log(`building with stats=${process.env.BUILD_WITH_STATS === "true"}`);

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export default {
	entry: {
		app: "./src/index.tsx",
	},
	mode: "production",
	plugins: [
		new CompressionPlugin({
			filename: "[file].gz",
			algorithm: "gzip",
			test: /\.js$|\.css$|\.html$/,
			threshold: 10240,
			minRatio: 0.8,
		}),
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			title: "RPG Tools",
			template: __dirname + "/src/index.html",
			favicon: __dirname + "/src/favicon_old.ico",
		}),
		new MiniCssExtractPlugin(),
	].concat(
		process.env.BUILD_WITH_STATS === "true"
			? [
					new StatsPlugin("stats.json", {
						chunkModules: true,
						exclude: [/node_modules[\\\/]react/],
					}),
					new Visualizer({
						filename: "./statistics.html",
					}),
			  ]
			: []
	),
	output: {
		filename: "[name].bundle.js",
		path: path.resolve(__dirname, "dist"),
		publicPath: "/",
	},
	resolve: {
		// alias: {
		// 	parchment: path.resolve(__dirname, "node_modules/parchment/src/parchment.ts"),
		// 	quill$: path.resolve(__dirname, "node_modules/quill/quill.js"),
		// },
		extensions: [".js", ".ts", ".svg", ".tsx"],
	},
	module: {
		rules: [
			{
				test: /\.m?js$/,
				resolve: {
					fullySpecified: false
				},
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: "babel-loader",
					options: {
						presets: [
							[
								"@babel/preset-env",
								{
									targets: {
										esmodules: true,
									},
								},
							],
							"@babel/preset-react",
						],
						plugins: [
							"@babel/plugin-proposal-object-rest-spread",
							"@babel/plugin-proposal-nullish-coalescing-operator",
							"@babel/plugin-proposal-class-properties",
						],
					},
				},
			},
			{
				test: /\.mjs$/,
				include: /node_modules/,
				type: "javascript/auto",
			},
			{
				test: /\.(ts|tsx)$/,
				resolve: {
					fullySpecified: false
				},
				use: [
					{
						loader: "ts-loader",
					},
				],
			},
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, "css-loader"],
			},
			{
				test: /\.(png|jpg|gif|ico|svg)$/,
				use: ["file-loader?name=[name].[ext]"],
				exclude: {
					or: [
						function (item) {
							return item.match(/node_modules\/quill\/assets\/icons\/(.*).svg/);
						},
					],
				},
			},
			{
				test: /node_modules\/quill\/assets\/icons\/(.*).svg/,
				use: [{ loader: "html-loader", options: { minimize: true } }],
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use: ["file-loader"],
			},
		],
	},
};
