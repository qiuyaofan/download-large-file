/// <reference types="vitest/config" />
// vite 配置 https://vitejs.dev/config/
import legacy from '@vitejs/plugin-legacy';
import vue from '@vitejs/plugin-vue';
import dotenv from 'dotenv';
import * as path from 'path';
import AutoImport from 'unplugin-auto-import/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';
import { injectHtml } from 'vite-plugin-html';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import svgLoader from 'vite-svg-loader';

export default defineConfig(({ command, mode }) => {
  const env = dotenv.config({ path: path.resolve(process.cwd(), `.env.${mode}`) }).parsed;
  if (!env) throw 'not env file existed!';

  const commonEnv = dotenv.config({ path: path.resolve(process.cwd(), `.env`) }).parsed ?? {};
  Object.assign(env, commonEnv, env);

  const isDev = command !== 'build';

  return {
    build: {
      target: ['chrome84', 'edge84', 'safari14.1', 'firefox63'],
    },
    css: {
      preprocessorOptions: {
        scss: {
          // 添加全局的 SCSS 样式
          additionalData: '@import "@/theme/var/index.scss";',
        },
      },
    },
    plugins: [
      vue(),
      svgLoader({
        defaultImport: 'url',
      }),
      createSvgIconsPlugin({
        // Specify the icon folder to be cached
        iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
        // Specify symbolId format
        symbolId: 'svg-icon-[name]',
      }),
      Components({
        // 全局按需导入 antdv 组件
        resolvers: [AntDesignVueResolver({ importStyle: 'less' })],
      }),
      AutoImport({
        imports: ['vue', 'vue-router'],
        dts: true,
        eslintrc: {
          enabled: true,
        },
      }),
      injectHtml({
        data: {
          title: env.VITE_APP_TITLE,
        },
      }),
      legacy({
        targets: ['Chrome 84', 'Edge 84', 'Safari 14.1', 'Firefox 63'],
        // https://github.com/vitejs/vite/tree/main/packages/plugin-legacy#modernpolyfills
        modernPolyfills: ['es/array', 'es/regexp'],
      }),
    ],
    resolve: {
      alias: [{ find: /^@(?=\/)/, replacement: path.resolve(__dirname, './src') }],
    },
    server: {
      port: Number(env.PORT),
    },
    test: {
      environment: 'jsdom',
      include: ['**/__tests__/*.{test,spec}.?(c|m)[jt]s?(x)'],
      setupFiles: ['./__tests__/setup.ts'],
    },
  };
});
