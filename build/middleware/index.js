const webpackHot = require('webpack-hot-middleware')
const webpackDev = require('webpack-dev-middleware')
const PassThrough = require('stream').PassThrough;
/**
 * express中间件改async模式 提供Koa使用
 *
 *
 * */
const devMiddleware = (compiler, opts) => {
    const expressMiddleware = webpackDev(compiler, opts)
    async function middleware (ctx, next) {
        await expressMiddleware(ctx.req, {
            end: (content) => {
                ctx.body = content
            },
            setHeader: (name, value) => {
                ctx.set(name, value)
            }
        }, next)
    }
    middleware.getFilenameFromUrl = expressMiddleware.getFilenameFromUrl
    middleware.waitUntilValid = expressMiddleware.waitUntilValid
    middleware.invalidate = expressMiddleware.invalidate
    middleware.close = expressMiddleware.close
    middleware.fileSystem = expressMiddleware.fileSystem
    return middleware
}

const hotMiddleware = (compiler, opts) => {
    const expressMiddleware = webpackHot(compiler, opts);
    const middleware = async (ctx, next) => {
        let stream = new PassThrough()
        ctx.body = stream
        await expressMiddleware(ctx.req, {
            write: stream.write.bind(stream),
            writeHead: (status, headers) => {
                ctx.status = status
                ctx.set(headers)
            }
        }, next)
    }
    middleware.publish = expressMiddleware.publish
    return middleware
}

module.exports = {
    hotMiddleware,
    devMiddleware
}
