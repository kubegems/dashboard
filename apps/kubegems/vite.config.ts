import { URL, fileURLToPath } from 'url';

import vue from '@vitejs/plugin-vue2';
import vueJsx from '@vitejs/plugin-vue2-jsx';
import { VuetifyResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';
import Markdown from 'vite-plugin-vue-markdown';
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
    vue({ include: [/\.vue$/, /\.md$/, /\.mdx$/] }),
    inheritAttrs() as any,
    Markdown(),
    Components({
      resolvers: [VuetifyResolver()],
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/, /\.mdx$/],
      dts: false,
    }),
    vueJsx(),
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
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // /Users/leonchen/code/kubegems/dashboard/node_modules/.pnpm/yaml@2.1.3/node_modules/yaml/browser/dist/compose/util-contains-newline.js
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/.pnpm/')[1].split('/')[0].toString();
          }
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false,
    proxy: {
      '/api/v1/edge-': {
        target: 'http://172.16.23.231:30001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, '/v1'),
      },
      '/api/v1': {
        // target: 'http://10.12.32.41:8020',
        target: 'http://demo.xiaoshiai.cn:30080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, '/api/v1'),
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
