const timestamp = new Date().getTime()
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  productionSourceMap: true,
  configureWebpack: {
    output: {
      filename: `js/[name].${timestamp}.js`,
      chunkFilename: '[id].[chunkhash].js',
    },
    performance: {
      hints: false,
      maxEntrypointSize: 256000,
      maxAssetSize: 256000,
    },
    optimization: {
      splitChunks: {
        minSize: 10000,
        maxSize: 250000,
      },
      minimizer: [
        new UglifyJsPlugin({
          uglifyOptions: {
            warnings: false,
            compress: {
              pure_funcs: ['console.debug'],
            },
          },
          sourceMap: true,
          parallel: true,
        }),
      ],
    },
    devServer: {
      disableHostCheck: true,
      proxy: {
        '/api/v1/': {
          target: 'http://10.12.32.9:8020',
          changeOrigin: true,
          pathRewrite: {
            '^/api/v1/': '/v1/',
          },
        },
        '/realtime/': {
          target: 'http://172.16.23.119:8080',
          changeOrigin: true,
          pathRewrite: {
            '^/realtime/': '/',
          },
        },
        '/api/lokiExport/': {
          target: 'http://172.16.23.119:8020',
          changeOrigin: true,
          pathRewrite: {
            '^/api/lokiExport/': '/lokiExport/',
          },
        },
      },
    },
    resolve: {
      alias: {
        assets: '@/assets',
        views: '@/views',
        plugins: '@/plugins',
      },
    },
  },
  transpileDependencies: ['vuetify'],
  publicPath: '/',
  css: {
    loaderOptions: {
      sass: {
        sassOptions: { outputStyle: 'expanded' },
      },
    },
    extract: true,
  },
}
