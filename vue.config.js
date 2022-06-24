const timestamp = new Date().getTime();
const path = require('path');

module.exports = {
  productionSourceMap: true,
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.mdx?$/,
          use: ['babel-loader', '@mdx-js/vue-loader'],
        },
      ],
    },
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
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: false,
      hot: true,
      allowedHosts: 'all',
      port: 8080,
      host: '0.0.0.0',
      proxy: {
        '/api/v1/': {
          target: 'http://local.kubegems.io:8020',
          changeOrigin: true,
          pathRewrite: {
            '^/api/v1/': '/v1/',
          },
        },
        '/realtime/': {
          target: 'http://local.kubegems.io:8080',
          changeOrigin: true,
          pathRewrite: {
            '^/realtime/': '/',
          },
        },
        '/api/lokiExport/': {
          target: 'http://local.kubegems.io:8020',
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
  publicPath: '/',
  css: {
    loaderOptions: {
      sass: {
        sassOptions: { outputStyle: 'expanded' },
      },
    },
    extract: { ignoreOrder: true },
  },
};
