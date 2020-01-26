

const path = require("path");
const webpack = require("webpack");
const uglify = require("uglifyjs-webpack-plugin");

module.exports = {
	devtool: 'source-map',
	entry: "./src/index.ts",
	output: {
		path: path.resolve(__dirname, './dist'),
		publicPath: '/dist/',
		filename: 'vue.cropper.min.js',
		library: "vue-img-cropper",
		libraryTarget: 'umd',
		umdNamedDefine: true
	},
	resolve: {
		extensions: ['.js',".ts", '.vue'],
		alias: {
			'vue$': 'vue/dist/vue.common.js'
		}
	},
	module: {
		rules: [{
			test: /\.vue$/,
			loader: 'vue-loader'
		},
			{
				test: /\.less$/,
				use: [
					{ loader: "style-loader" },
					{ loader: "css-loader" },
					{ loader: "less-loader" }
				]
			},
			{
				test: /\.js$/,
				exclude: /node_modules|vue\/dist|vue-router\/|vue-loader\/|vue-hot-reload-api\//,
				loader: 'babel-loader'
			},
			{
				test: /\.(png|jpg|gif|ttf|svg|woff|eot)$/,
				loader: 'url-loader',
				query: {
					limit: 30000,
					name: '[name].[ext]?[hash]'
				}
			},
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
				exclude: /node_modules/,
				options: {
					appendTsSuffixTo: [/\.vue$/],
				}
			}
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			"process.env": {
				NODE_ENV: JSON.stringify("production")
			}
		})
	]
};
