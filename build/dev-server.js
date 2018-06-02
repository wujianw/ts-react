const path = require('path')
const Koa = require('koa');
const webpack = require('webpack')
const config = require('../config')
const opn = require('opn')
const {proxyMiddleware} = require('koa-http-proxy-middleware')
const devWebpackConfig = require('./webpack.dev.conf')
const { hotMiddleware,devMiddleware } = require('./middleware')
const portfinder = require('portfinder')
const utils = require('./utils')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')




const promise = new Promise((resolve, reject) => {
    portfinder.basePort = process.env.PORT || config.dev.port
    portfinder.getPort((err, port) => {
        if (err) {
            reject(err)
        } else {
            process.env.PORT = port
            devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
                compilationSuccessInfo: {
                    messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
                },
                onErrors: config.dev.notifyOnErrors
                    ? utils.createNotifierCallback()
                    : undefined
            }))

            let compiler = webpack(devWebpackConfig)

            let entityHotMiddleware = hotMiddleware(compiler, {
                log: () => {},
                path: '/__webpack_hmr'
            })

            // 编辑html文件后 刷新页面
            compiler.plugin('compilation', function (compilation) {
                compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
                    entityHotMiddleware.publish({ action: 'reload' })
                    cb()
                })
            })

            const proxyTable = config.dev.proxyTable
            let app = new Koa()

            // 使用 HTML5 history API  *一般这个用不上
            app.use(require('koa-connect-history-api-fallback')())

            // webpack编译中间件
            app.use(devMiddleware(compiler, devWebpackConfig.devServer))

            // 热更新中间件
            app.use(entityHotMiddleware)

            // 静态文件处理
            let staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
            app.use(require('koa-static')('./static', staticPath))

            // 处理代理接口 转发
            Object.keys(proxyTable).forEach(function (context) {
                let options = proxyTable[context]
                if (typeof options === 'string') {
                    options = { target: options }
                }
                app.use(proxyMiddleware(context, options))
            })

            app.listen(port,devWebpackConfig.devServer.host,function(err){
                if(err){
                    console.log('err',err)
                    return
                }
                if(devWebpackConfig.devServer.open){
                    opn(`http://${devWebpackConfig.devServer.host}:${port}`)
                }
            })
        }
    })
})
