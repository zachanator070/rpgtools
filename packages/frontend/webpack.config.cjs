const path = require('path');
const CompressionPlugin = require("compression-webpack-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const StatsPlugin = require("stats-webpack-plugin");
const Visualizer = require("webpack-visualizer-plugin");

const isProduction = process.env.NODE_ENV === 'production';

console.log(`Build is production: ${isProduction}`);

const stylesHandler = 'style-loader';

const config = {
    entry: {
        app: './src/index.tsx'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: "/",
    },
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
            favicon: __dirname + "/src/favicon.ico",
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                loader: 'ts-loader',
                exclude: ['/node_modules/'],
            },
            {
                test: /\.css$/i,
                use: [stylesHandler,'css-loader'],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif|ico)$/i,
                type: 'asset',
            },

            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
    },
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';
    } else {
        config.mode = 'development';
        config.devtool = "inline-source-map";
    }
    if (process.env.BUILD_WITH_STATS === "true") {
        config.plugins = config.plugins.concat(
            config.plugins,
            [
                new StatsPlugin("stats.json", {
                    chunkModules: true,
                    exclude: [/node_modules[\\\/]react/],
                }),
                new Visualizer({
                    filename: "./statistics.html",
                }),
            ]
        )
    }
    return config;
};
