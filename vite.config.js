import { fileURLToPath, URL } from 'url';

import vue from '@vitejs/plugin-vue2';
import vueJsx from '@vitejs/plugin-vue2-jsx';
import { VuetifyResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';
import { chunkSplitPlugin } from 'vite-plugin-chunk-split';
import Markdown from 'vite-plugin-md';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  plugins: [
    vue({ include: [/\.vue$/, /\.md$/] }),
    Markdown(),
    Components({
      resolvers: [VuetifyResolver()],
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
    }),
    vueJsx(),
    chunkSplitPlugin({
      strategy: 'default',
      customSplitting: {
        'vue-vendor': ['vue', 'vue-clipboard2', 'vue-form-wizard', 'vue-i18n', 'vue-meta', 'vuex'],
        'vuetify-vendor': ['vuetify'],
        xterm: ['xterm', 'xterm-addon-fit', 'xterm-addon-web-links'],
        filepond: [
          'filepond',
          'filepond-plugin-file-validate-size',
          'filepond-plugin-file-validate-type',
          'vue-filepond',
        ],
        '@iconify-json/emojione': ['@iconify-json/emojione'],
        '@iconify-json/logos': ['@iconify-json/logos'],
        '@iconify-json/mdi': ['@iconify-json/mdi'],
        'base-tool': ['moment', 'lodash', 'js-yaml', 'js-base64', 'ajv', 'vuedraggable'],
        highlight: ['highlight.js'],
        chart: ['chart.js', 'chartjs-adapter-moment', 'chartjs-plugin-doughnutlabel-v3'],
        'vue2-ace-editor': ['vue2-ace-editor'],
        'vue-slider-component': ['vue-slider-component'],
      },
    }),
  ],
  envPrefix: 'VUE_APP_',
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/scss/variables.scss";',
      },
      sass: {
        additionalData: ['@import "@/scss/variables.scss"', ''].join('\n'),
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 2048,
  },
  server: {
    host: '0.0.0.0',
    // port: 8080,
    strictPort: true,
    proxy: {
      'models/model/infer': {
        target: 'http://api.models.kubegems.io:30939',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, ''),
      },
      '/api/v1': {
        target: 'http://local.kubegems.io:30939',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, '/v1'),
        ws: true,
      },
      '/realtime/': {
        target: 'http://local.kubegems.io:8020',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/realtime\//, '/'),
        ws: true,
      },
      '/api/lokiExport/': {
        target: 'http://local.kubegems.io:8020',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/lokiExport\//, '/lokiExport/'),
      },
    },
  },
});
