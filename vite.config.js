import { URL, fileURLToPath } from 'url';

import vue from '@vitejs/plugin-vue2';
import vueJsx from '@vitejs/plugin-vue2-jsx';
import { VuetifyResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';
import { chunkSplitPlugin } from 'vite-plugin-chunk-split';
import Markdown from 'vite-plugin-md';
import VueSetupExtend from 'vite-plugin-vue-setup-extend';
import inheritAttrs from 'vite-plugin-vue-setup-inherit-attrs';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  plugins: [
    vue({ include: [/\.vue$/, /\.md$/] }),
    inheritAttrs(),
    Markdown(),
    Components({
      resolvers: [VuetifyResolver()],
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      dts: false,
    }),
    vueJsx(),
    chunkSplitPlugin({
      strategy: 'default',
      customSplitting: {
        'vue-vendor': ['vue', 'vue-clipboard2', 'vue-form-wizard', 'vue-meta', 'vuex'],
        'vuetify-vendor': ['vuetify'],
        xterm: ['xterm', 'xterm-addon-fit'],
        filepond: [
          'filepond',
          'filepond-plugin-file-validate-size',
          'filepond-plugin-file-validate-type',
          'vue-filepond',
        ],
        '@iconify-json/logos': ['@iconify-json/logos'],
        '@iconify-json/mdi': ['@iconify-json/mdi'],
        'base-tool': ['lodash', 'yaml', 'js-yaml', 'js-base64', 'ajv', 'vuedraggable', 'brace'],
        highlight: ['highlight.js'],
        chart: ['chart.js', 'chartjs-adapter-moment', 'chartjs-plugin-doughnutlabel-v3'],
        'vue2-ace-editor': ['vue2-ace-editor'],
        'vue-slider-component': ['vue-slider-component'],
        moment: ['moment'],
        'vue-table-dynamic': ['vue-table-dynamic'],
        'vue-i18n': ['vue-i18n'],
      },
    }),
    VueSetupExtend(),
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
    port: 3000,
    strictPort: true,
    proxy: {
      'models/model/infer': {
        target: 'http://api.models.kubegems.io:30939',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, ''),
      },
      '/api/v1/edge-': {
        target: 'http://172.16.23.231:30001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, '/v1'),
      },
      '/api/v1': {
        // target: 'http://10.12.32.41:8020',
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
