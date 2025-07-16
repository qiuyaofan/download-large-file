import type { Component } from 'vue';

import type { INTERFACE_ROLE_KEY } from '@/constants';
// 拓展 router 的 meta 属性
declare module 'vue-router' {
  interface RouteMeta {
    /**
     * 指定使用的布局组件，默认为 'menu'
     */
    layout?: 'menu' | 'none';

    /**
     * 页面标题
     */
    title?: string;

    /**
     * 在右侧菜单上显示的icon
     */
    icon?: string | Component;

    /**
     * 不显示在菜单上
     */
    hidden?: boolean;

    /**
     * 上一个页面的路由名
     */
    previousView?: string;
    /**
     * 权限
     */
    auths?: Array<INTERFACE_ROLE_KEY>;

    /**
     * 父页面的路由名
     */
    parentName?: string;
  }
}
