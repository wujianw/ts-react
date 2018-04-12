const path = require('path')
const Koa = require('koa');
const webpack = require('webpack')
const config = require('../config')
const opn = require('opn')
const {proxyMiddleware} = require('koa-http-proxy-middleware')
const webpackConfig = require('./webpack.dev.conf')
const { devMiddleware } = require('koa-webpack-middleware')

const port = process.env.PORT || config.dev.port
const proxyTable = config.dev.proxyTable

let app = new Koa()
let compiler = webpack(webpackConfig)





// force page reload when html-webpack-plugin template changes


const webpackHot = require('webpack-hot-middleware')
const PassThrough = require('stream').PassThrough;

const hotMiddleware = (compiler, opts) => {
    const middleware = webpackHot(compiler, opts);
    const publish = middleware.publish
    const fun = async (ctx, next) => {
        let stream = new PassThrough()
        ctx.body = stream
        await middleware(ctx.req, {
            write: stream.write.bind(stream),
            writeHead: (status, headers) => {
                ctx.status = status
                ctx.set(headers)
            }
        }, next)
    }
    fun.publish = publish
    return fun

}
let _hotMiddleware = hotMiddleware(compiler, {
    log: () => {}
})
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
      _hotMiddleware.publish({ action: 'reload' })
    cb()
  })
})

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(context, options))
})

// handle fallback for HTML5 history API
app.use(require('koa-connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    stats: {
        colors: true,
        chunks: false
    }
}))

// enable hot-reload and state-preserving
// compilation error display
app.use(_hotMiddleware)

// serve pure static assets
let staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(require('koa-static')('./static', staticPath))

module.exports = app.listen(port, function (err) {
  if (err) {
    console.log(err)
    return
  }
  var uri = 'http://localhost:' + port
  console.log('Listening at ' + uri + '\n')
  opn(uri)
})
