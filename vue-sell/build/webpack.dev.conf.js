'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')
// const jsonServer = require('json-server') // 引入文件
const fs = require('fs'); // node模块，文件系统
const express = require('express') // node模块，web模块
const bodyParser = require('body-parser') // 引入组件，用它返回JSON数据

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
      ],
    },
    hot: true,
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: config.dev.poll,
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})

/*json-server 
const apiServer = jsonServer.create(); // 创建服务器
// const apiRouter = jsonServer.router(path.join(__dirname, 'db.json'));// 数据文件
const apiRouter = jsonServer.router('db.json');// 工程中的数据文件，使用上面那个可能会找不到资源
const middlewares = jsonServer.defaults(); // 返回JSON文件使用的中间件

apiServer.use(middlewares)
apiServer.use('/api',apiRouter)
apiServer.listen(8081, () => { // 监听的端口
  console.log('JSON Server is running')
})
*/
var apiServer = express(); // 创建服务器
var apiRouter = express.Router() // 创建路由

apiServer.use(bodyParser.urlencoded({extended: true}))
apiServer.use(bodyParser.json())
apiServer.use('/api', apiRouter); // 路由根目录

apiRouter.get('/', function (req, res) { // 如果设置了use的路径参数，这个就会被覆盖：/ ->> /api
  res.json({message: 'hooray! welcome to our api!'})
})
// /:apiName 路径变量，/api/getUser [apiName == getUser]
apiRouter.route('/:apiName').all(function (req, res) { // .all 所有请求都走这个
  fs.readFile('./db.json', 'utf8', function (err, data) { // (文件全路径, 编码格式, 回调函数(异常，取到的数据))
    if (err) { throw err }
    var data = JSON.parse(data) // 将字符串转成对象
    if (data[req.params.apiName]) { // 判断这个对象中有没有这个属性
      res.json(data[req.params.apiName]) // 返回
    } else {
      res.send('no such api name')
    }
  });
});
apiServer.listen(8081, function (err) {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Listening at http://localhost:8090');
})