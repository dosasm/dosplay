const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const devMode = process.env.NODE_ENV !== "production";
const CopyPlugin = require('copy-webpack-plugin');
const path=require('path')

module.exports = {
  // 入口设置为ts
  entry:'./src/index.ts',
  // 输出文件
  output:{
    filename:'app.js'
  },
  resolve:{
    // 模块导入 扩展名的处理，js、ts、tsx后缀的文件需要导入
    extensions:['.js','.ts','.tsx','.css']
  },
  // 便于调试的sourcemap
  devtool:'eval-cheap-module-source-map',
  module:{
    rules:[
      // 配置一个ts-load的规则，使用ts-loader将ts文件编译
      {
        test: /\.tsx?$/i, // 匹配ts或tsx结尾的文件
        use:[{
          loader:'ts-loader'
        }],
        exclude:/node_modules/
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
  plugins:[
    new CopyPlugin({
      patterns: [
        { from: path.resolve(path.resolve(__dirname),"../dist"), to: 'dist' },
        // { from: 'other', to: 'public' },
      ],
    }),
    new HtmlWebpackPlugin({
      // 自动在html中导入 output里配置的输出的js
      template:'./public/index.html'
    })
  ].concat(devMode ? [] : [new MiniCssExtractPlugin()]),
}