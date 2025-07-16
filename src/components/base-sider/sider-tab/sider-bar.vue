<script lang="ts" setup>
import type { MenuProps } from 'ant-design-vue';
import { type Component, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const router = useRouter();
const route = useRoute();

export interface MenuItem {
  title: string;
  component?: Component;
  componentAttrs?: any;
}
const emit = defineEmits<{
  click: [MenuItem];
}>();
export interface Props {
  menuData: MenuItem[];
}
const props = defineProps<Props>();

const selectedKeys = ref<string[]>([]);

const handleClickMenu: MenuProps['onClick'] = (item) => {
  const _item = props.menuData.find((x) => x.title === item.key);
  if (_item) {
    emit('click', _item);
  }
};

watch(
  () => props.menuData,
  (value) => {
    if (value?.length) {
      const { activeTab } = route.query;
      const item = route.query.activeTab
        ? value.find((x) => x.title === activeTab) || value[0]
        : value[0];
      if (selectedKeys.value) selectedKeys.value = [item.title];
      emit('click', item);
    }
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <div class="sider-main">
    <a-menu v-model:selectedKeys="selectedKeys" mode="inline" @click="handleClickMenu">
      <a-menu-item :key="menuItem.title" v-for="menuItem in menuData">{{
        menuItem.title
      }}</a-menu-item>
    </a-menu>
  </div>
</template>
<style lang="scss" scoped>
$width: 130px;
.sider-main {
  width: $width;
  flex: 0 0 $width;
  background: #fff;
  padding-top: 20px;
  border-right: 1px solid $border-color;
  padding: 15px;
  :deep() {
    .ant-menu-inline.ant-menu-root {
      border-right: none;
      .ant-menu-submenu-title {
        margin: 0;
      }
      .ant-menu-item {
        color: $font-color2;
        &.ant-menu-item-only-child {
          padding: 0 15px;
          text-align: center;
        }

        &.ant-menu-item-active,
        &.ant-menu-item-selected {
          background: $primary-background;
          border-radius: 8px;
          .ant-menu-title-content {
            // margin-left: -30px;
          }
        }
        &.ant-menu-item-selected {
          &::after {
            display: none;
          }
        }
        &:not(:last-child) {
          margin-bottom: 0px;
        }
      }
    }
  }
}
</style>
