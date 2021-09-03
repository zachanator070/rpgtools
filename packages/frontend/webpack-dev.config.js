const config = require("./webpack.config");

config.mode = "development";
config.devtool = "eval-source-map";

module.exports = config;
