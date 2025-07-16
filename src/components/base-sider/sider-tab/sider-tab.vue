<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import type { MenuItem } from './sider-bar.vue';
import Siderbar from './sider-bar.vue';
const router = useRouter();
const route = useRoute();

const emit = defineEmits<{
  click: [MenuTabItem];
}>();
export type MenuTabItem = MenuItem;
export interface Props {
  menuData: MenuTabItem[];
}
const props = defineProps<Props>();

const selectItem = ref<MenuTabItem>();

const handleMenuClick = (item: MenuTabItem) => {
  selectItem.value = item;
  router.replace({
    ...route,
    query: {
      ...route.query,
      activeTab: item.title,
    },
  });
  emit('click', item);
};
</script>

<template>
  <div class="sider-tab-main">
    <Siderbar :menuData="menuData" @click="handleMenuClick"></Siderbar>
    <div class="tab-panel-main">
      <slot :data="selectItem" />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.sider-tab-main {
  display: flex;
}
.tab-panel-main {
  flex: 1;
  overflow: hidden;
}
</style>
