const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const StatsPlugin = require('stats-webpack-plugin');
const Visualizer = require('webpack-visualizer-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

console.log(`building with stats=${process.env.BUILD_WITH_STATS === 'true'}`);

module.exports = {
	entry: {
		app: './src/index.js'
	},
	mode: "production",
	plugins: [
		new CompressionPlugin({
			filename: "[path].gz[query]",
			algorithm: "gzip",
			test: /\.js$|\.css$|\.html$/,
			threshold: 10240,
			minRatio: 0.8
	    }),
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			title: 'rpgtools',
			template: __dirname + "/src/index.html"
		}),
		new MiniCssExtractPlugin()
	].concat(
		process.env.BUILD_WITH_STATS === 'true' ?
		[
			new StatsPlugin('stats.json', {
				chunkModules: true,
				exclude: [/node_modules[\\\/]react/]
			}),
			new Visualizer({
				filename: './statistics.html'
			}),
		]
		: []
	),
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist'),
		publicPath: '/'
	},
	resolve: {
		alias: {
			'parchment': path.resolve(__dirname, 'node_modules/parchment/src/parchment.ts'),
			'quill$': path.resolve(__dirname, 'node_modules/quill/quill.js'),
		},
		extensions: ['.js', '.ts', '.svg']
	},
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env', '@babel/preset-react'],
						plugins: [
							'@babel/plugin-proposal-object-rest-spread',
							'@babel/plugin-proposal-nullish-coalescing-operator',
							'@babel/plugin-proposal-class-properties'
						]
					}
				}
			},
			{
				test: /\.ts$/,
				use: [{
					loader: 'ts-loader',
					options: {
						compilerOptions: {
							declaration: false,
							target: 'es5',
							module: 'commonjs'
						},
						transpileOnly: true
					}
				}]
			},
			{
				test: /\.svg$/,
				use: [{
					loader: 'html-loader',
					options: {
						minimize: true
					}
				}]
			},
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader'
				]
			},
			{
				test: /\.(png|jpg|gif|ico)$/,
				use: [
					'file-loader?name=[name].[ext]'
				]
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use: [
					'file-loader'
				]
			}
		]
	}
};