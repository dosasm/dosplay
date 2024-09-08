const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const devMode = process.env.NODE_ENV !== "production";
const CopyPlugin = require('copy-webpack-plugin');
const copy = require('copy');
const { fork } = require('child_process');

fork("assembly-tool/compress.js")
copy("../dist/types/**", "jsdos/types", function () { })

module.exports = {
  // 入口设置为ts
  entry: './src/index.ts',
  // 输出文件
  output: {
    filename: 'app.js'
  },
  resolve: {
    // 模块导入 扩展名的处理，js、ts、tsx后缀的文件需要导入
    extensions: ['.js', '.ts', '.tsx', '.css']
  },
  // 便于调试的sourcemap
  devtool: 'eval-cheap-module-source-map',
  module: {
    rules: [
      // 配置一个ts-load的规则，使用ts-loader将ts文件编译
      {
        test: /\.tsx?$/i, // 匹配ts或tsx结尾的文件
        use: [{
          loader: 'ts-loader'
        }],
        exclude: /node_modules/
      },
      {
        // If you enable `experiments.css` or `experiments.futureDefaults`, please uncomment line below
        // type: "javascript/auto",
        test: /\.(sa|sc|c)ss$/i,
        use: [
          devMode ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          // "postcss-loader",
          // "sass-loader",
        ],
      },
    ]
  },
  // 插件
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "../dist/*.*",
          to({ context, absoluteFilename }) {
            return Promise.resolve("jsdos/[name][ext]");
          },
        },
        {
          from: "../dist/test/*.js",
          to({ context, absoluteFilename }) {
            return Promise.resolve("jsdos/test/[name][ext]");
          },
        },
        {
          from: "../dist/test/*.jsdos",
          to({ context, absoluteFilename }) {
            return Promise.resolve("jsdos/bundle/[name][ext]");
          },
        },
        {
          from: "assembly-tool/*.jsdos", to({ context, absoluteFilename }) {
            return Promise.resolve("jsdos/bundle/[name][ext]");
          },
        }
      ],
    }),
    new HtmlWebpackPlugin({
      // 自动在html中导入 output里配置的输出的js
      template: './public/index.html'
    })
  ].concat(devMode ? [] : [new MiniCssExtractPlugin()]),
}