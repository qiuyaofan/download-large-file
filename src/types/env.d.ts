/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// 添加环境变量的类型声明 https://cn.vitejs.dev/guide/env-and-mode.html#intellisense
interface ImportMetaEnv {
  VITE_APP_TITLE: string;
  VITE_BASE_URL: string;
  SCV_VITE_BASE_URL: string;
  VITE_EXTERNAL_ASSETS_BASE_URL_1: string;
  VITE_EXTERNAL_ASSETS_PROXY_TARGET_URL_1: string;
  VITE_EXTERNAL_ASSETS_BASE_URL_2: string;
  VITE_EXTERNAL_ASSETS_PROXY_TARGET_URL_2: string;
  VITE_EXTERNAL_ASSETS_BASE_URL_3: string;
  VITE_EXTERNAL_ASSETS_PROXY_TARGET_URL_3: string;
  VITE_EXTERNAL_ASSETS_BASE_URL_4: string;
  VITE_EXTERNAL_ASSETS_PROXY_TARGET_URL_4: string;
  // 更多环境变量...
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
