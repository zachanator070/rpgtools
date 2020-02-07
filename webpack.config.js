const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
	entry: {
		app: './src/app/index.js'
	},
	mode: "production",
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			title: 'rpgtools',
			template: __dirname + "/src/app/index.html"
		})
	],
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
						plugins: ['@babel/plugin-proposal-object-rest-spread', '@babel/plugin-proposal-nullish-coalescing-operator']
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
					'style-loader',
					'css-loader'
				]
			},
			{
				test: /\.(png|jpg|gif)$/,
				use: [
					'file-loader'
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