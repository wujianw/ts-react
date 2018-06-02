const path = require('path')
module.exports = {

    dev: {
        env: require('./dev.env'),
        host: '0.0.0.0',
        port: 8080,
        assetsSubDirectory: 'static',
        assetsPublicPath: '/',
        autoOpenBrowser:false,
        proxyTable: {},
        cssSourceMap: false,
        notifyOnErrors: true,
    },
    build: {
        env: require('./prod.env'),
        index: path.resolve(__dirname, '../dist/index.html'),
        assetsRoot: path.resolve(__dirname, '../dist'),
        assetsSubDirectory: 'static',
        assetsPublicPath: '/',
        productionSourceMap: true,
        productionGzip: false,
        productionGzipExtensions: ['js', 'css'],
        bundleAnalyzerReport: process.env.npm_config_report
    }
}
