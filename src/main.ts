import './theme/index.scss';
import 'dayjs/locale/zh-cn';

import dayjs from 'dayjs';

dayjs.locale('zh-cn');

import { createApp } from 'vue';

import { name, version } from '../package.json';
import App from './App.vue';
import router from './router';
import stores from './stores';
// eslint-disable-next-line no-console
console.log(`[${name}] runnning on version ${version} ...`);
import 'ant-design-vue/dist/reset.css';

const app = createApp(App);
app.use(stores);
app.use(router);
app.mount('#app');
