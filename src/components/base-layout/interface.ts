import type { RouteMeta } from 'vue-router';

export interface MenuItem extends RouteMeta {
  routeName?: string;
  label: string;
  icon?: string;
  children?: MenuItem[];
  disabled?: boolean;
}

export type ActiveSiderMenuItem = Omit<MenuItem, 'label'> & {
  parent?: MenuItem;
  label?: string;
};
