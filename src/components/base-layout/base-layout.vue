<script lang="ts" setup>
import type { Component } from 'vue';
import type { RouteLocationNormalizedLoaded } from 'vue-router';
import { type RouteMeta, useRoute } from 'vue-router';

import BaseLayoutMenu from './base-layout-menu.vue';
import BaseLayoutNone from './base-layout-none.vue';
const route = useRoute();
const layouts: Record<Exclude<RouteMeta['layout'], undefined>, Component> = {
  menu: BaseLayoutMenu,
  none: BaseLayoutNone,
};

const layoutComponentOf = (route: RouteLocationNormalizedLoaded) => {
  // 修复登录页面刷新闪现menu的问题
  if (route.path === '/' && !route.meta?.layout) return layouts['none'];
  return layouts[route.meta?.layout ?? 'menu'];
};
</script>

<template>
  <component :is="layoutComponentOf(route)" :route="route"> </component>
</template>

<style lang="scss" scoped></style>
