// 创建 Vue Router https://next.router.vuejs.org/zh/api/#createrouter
import { notification } from 'ant-design-vue';
import { createRouter, createWebHistory } from 'vue-router';

import routes from './modules';

const router = createRouter({
  history: createWebHistory(),
  routes: routes as any[],
});

router.beforeEach(async (to, from) => {
  if (to.matched.length > 0) return;
  const firstRoute = router.options.routes[0];
  return firstRoute;
});

router.onError((error: Error) => {
  console.info(error);
  if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
    notification.info({
      message: '页面切换异常，即将尝试刷新页面',
      description: '刷新后请重新切换您希望访问的页面',
      duration: 3,
    });
    // setTimeout(() => {
    //   router.go(0);
    // }, 3000);
  }
});

export default router;
