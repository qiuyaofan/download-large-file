<script lang="ts" setup>
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue';
import { useVModel } from '@vueuse/core';
import { ref, watch } from 'vue';

import { LAYOUT_SIDER_COLLAPSE } from '@/constants/storage';
import { setStorage } from '@/utils/storage';
export interface Props {
  isCollapse: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  'update:isCollapse': [Props['isCollapse']];
}>();
const vmodelIsCollapse = useVModel(props, 'isCollapse', emit);

const toggleCollapse = () => {
  vmodelIsCollapse.value = !vmodelIsCollapse.value;
};
watch(
  () => props.isCollapse,
  (value) => setStorage(LAYOUT_SIDER_COLLAPSE, !!value ? 'true' : 'false'),
);
</script>

<template>
  <div class="base-sider-collapse" @click="toggleCollapse">
    <menu-unfold-outlined v-if="isCollapse" />
    <menu-fold-outlined v-else />
  </div>
</template>

<style lang="scss" scoped>
.base-sider-collapse {
  width: 100%;
  height: 39px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  cursor: pointer;
}
</style>
