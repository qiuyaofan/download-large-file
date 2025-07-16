import { pick } from 'lodash-es';
import { type RouteLocationNormalizedLoaded, type RouteRecordRaw } from 'vue-router';

import routes from '@/router';

import type { MenuItem } from './interface';
export type SiderFlatRouteRecordRaw = RouteRecordRaw & {
  parent?: Pick<SiderFlatRouteRecordRaw, 'name' | 'path' | 'parent'>;
};

export const useSiderMenu = () => {
  // 根据route填充menu名称
  const getMenuDataFromRoute = () => {
    const menuData: MenuItem[] = [
      {
        label: '管理',
        icon: 'menu-exam', //等设计稿
        children: [
          {
            label: '下载管理',
            routeName: 'TaskManageList',
          },
        ],
      },
    ];
    return menuData;
  };

  // 用于快速查找菜单数据
  const getMenuDataNames = () => {
    const result: { [x: string]: MenuItem } = {};
    menuData.forEach((item) => {
      if (!item.children?.length) return;
      item.children.forEach((child) => {
        if (child.routeName) {
          child.parent = pick(item, 'label', 'icon');
          result[child.routeName] = child;
        }
      });
    });
    return result;
  };

  const menuData = getMenuDataFromRoute();
  const menuDataNames = getMenuDataNames();

  // 根据当前路由返回选中的菜单、父元素菜单
  const getActiveKeys = (route: RouteLocationNormalizedLoaded) => {
    let name = route.name as string;
    if (name && menuDataNames[name]) {
      return {
        name,
        parentMenus: menuDataNames[name].parent,
      };
    }
    name = route.meta?.parentName as string;
    if (name && menuDataNames[name]) {
      return {
        name,
        parentMenus: menuDataNames[name],
      };
    }
  };
  return {
    menuData,
    getActiveKeys,
  };
};
