<template>
  <a-layout class="base-layout-menu" :class="{ 'no-header': isHide }">
    <base-header v-if="!isHide" />

    <!-- 暂时隐藏菜单栏 -->
    <div class="base-layout">
      <BaseSider></BaseSider>
      <div class="base-layout-content">
        <a-layout-content
          class="a-layout-content"
          :style="{ margin: 0, minHeight: '280px', overflow: 'auto' }"
        >
          <router-view v-slot="{ Component, route }">
            <component v-if="!route.meta.keepAlive" :key="null" :is="Component" />
          </router-view>
        </a-layout-content>
      </div>
    </div>
  </a-layout>
</template>

<script lang="ts" setup>
// 兼容带有菜单的布局
import { computed } from 'vue';
import type { RouteLocationNormalizedLoaded } from 'vue-router';

import BaseSider from './base-sider.vue';

const props = defineProps<{
  route: RouteLocationNormalizedLoaded;
}>();
const isHide = computed(() => props.route.meta.header === 'none');
</script>

<style lang="scss" scoped>
.base-layout {
  display: flex;
  flex: auto;
  min-height: $layout-content-back-height;
}

.base-layout-menu {
  // height: 100vh;
  background: $page-background;
}
.base-layout-content {
  flex: 1;
  width: 0;
  overflow: auto;
}
.no-header {
  .base-layout-content {
    padding-top: 0;
  }
}

.layout-menu {
  padding: 12px 0;
}
</style>
