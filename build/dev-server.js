const path = require('path')
const Koa = require('koa');
const webpack = require('webpack')
const config = require('../config')
const opn = require('opn')
const {proxyMiddleware} = require('koa-http-proxy-middleware')
const webpackConfig = require('./webpack.dev.conf')
const { hotMiddleware,devMiddleware } = require('./middleware')

const port = process.env.PORT || config.dev.port

const proxyTable = config.dev.proxyTable

let app = new Koa()

let compiler = webpack(webpackConfig)

let _hotMiddleware = hotMiddleware(compiler, {
    log: () => {},
    path: '/__webpack_hmr'
})

// 编辑html文件后 刷新页面
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
      _hotMiddleware.publish({ action: 'reload' })
    cb()
  })
})

// 处理代理接口 转发
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(context, options))
})

// 使用 HTML5 history API  *一般这个用不上
app.use(require('koa-connect-history-api-fallback')())

// webpack编译中间件
app.use(devMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    quiet : true,// 关闭编译日志
    stats: {
        colors: true,
        chunks: false
    }
}))

// 热更新中间件
app.use(_hotMiddleware)

// 静态文件处理
let staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(require('koa-static')('./static', staticPath))

// 启动koa 本地开发服务器
module.exports = app.listen(port, function (err) {
  if (err) {
    console.log('err',err)
    return
  }
  let uri = 'http://localhost:' + port
  console.log('Listening at ' + uri + '\n')
  opn(uri)
})
