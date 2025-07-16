import type { RouteRecordRaw } from 'vue-router';

const layouts: RouteRecordRaw = {
  name: 'TaskManageList',
  path: '/task-list',
  component: () => import('@/views/task-manage/list.vue'),
  meta: { title: '下载管理' },
};

export default layouts;
