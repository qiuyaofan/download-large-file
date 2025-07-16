import 'virtual:svg-icons-register';

import type { App } from 'vue';

import SvgIcon from './svg-icon.vue';

/**
 * 全局注册自定义组件
 * @param app
 */
export function setupSvgIcon(app: App) {
  app.component('SvgIcon', SvgIcon);
}
