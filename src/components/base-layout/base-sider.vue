<script lang="ts" setup>
import { AppstoreOutlined } from '@ant-design/icons-vue';
import type { MenuProps } from 'ant-design-vue';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { LAYOUT_SIDER_COLLAPSE } from '@/constants/storage';
import { getStorage } from '@/utils/storage';

import BaseSiderCollapse from './base-sider-collapse.vue';
import { useLayoutStore } from './layout-store';
import { useSiderMenu } from './use-base-sider';

const selectedKeys = ref<string[]>([]);
const activeRoute = ref();
const route = useRoute();
const router = useRouter();
const isCollapse = ref(getStorage(LAYOUT_SIDER_COLLAPSE) === 'true');
// const setCollapse = (value: boolean) => (isCollapse.value = value);
const { setSiderActive } = useLayoutStore();

const { menuData: defaultMenuData, getActiveKeys } = useSiderMenu();

const menuData = computed(() => {
  //菜单权限所有帐号都有 可以先不启用
  let resData = [...defaultMenuData];
  // if (!permissions || !permissions.length) return [];
  // resData.forEach((firstitem) => {
  //   firstitem.children?.forEach((seconditem) => {
  //     let i = permissions.findIndex((item: any) => item.name === seconditem.label);
  //     if (i < 0) seconditem.hidden = true;
  //   });
  //   firstitem.children = firstitem.children?.filter((item) => !item?.hidden);
  // });
  // resData = resData.filter((item) => item.children?.length !== 0);
  return resData;
});

const getOpenKeys = () => {
  return isCollapse.value ? [] : menuData.value?.map((item) => item.label, [] as string[]);
};
const openKeys = ref(getOpenKeys());

const handleClickMenu: MenuProps['onClick'] = (item) => {
  if (item.key) {
    router.push({ name: item.key as any });
  }
};
watch(
  () => isCollapse.value,
  (value) => {
    if (!value && !openKeys.value.length) {
      openKeys.value = getOpenKeys();
    }
  },
);

watch(
  route,
  (value) => {
    if (value.meta.hidden || value.path === '/') return;
    const data = getActiveKeys(value);
    if (data && data.name && data.parentMenus) {
      const { name, parentMenus } = data;
      selectedKeys.value = name ? [name] : [];
      setSiderActive({ ...parentMenus });
    }
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <div class="base-sider-main" :class="{ isCollapse: isCollapse }">
    <a-menu
      v-model:openKeys="openKeys"
      v-model:selectedKeys="selectedKeys"
      mode="inline"
      @click="handleClickMenu"
      :inline-collapsed="isCollapse"
    >
      <a-sub-menu :key="menuLevel1.label" v-for="menuLevel1 in menuData">
        <template #icon>
          <SvgIcon :name="menuLevel1.icon" :size="20" class="menu-title-icon" />
        </template>
        <template #title>{{ menuLevel1.label }}</template>
        <a-menu-item :key="menuLevel2.routeName" v-for="menuLevel2 in menuLevel1.children">{{
          menuLevel2.label
        }}</a-menu-item>
      </a-sub-menu>
    </a-menu>
    <div class="base-collapse-main">
      <BaseSiderCollapse v-model:isCollapse="isCollapse"></BaseSiderCollapse>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.base-sider-main {
  position: relative;
  width: $layout-sider-width;
  flex: 0 0 $layout-sider-width;
  background: #fff;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.1);
  padding-top: 6px;
  &.isCollapse {
    width: $layout-sider-collapse-width;
    flex: 0 0 $layout-sider-collapse-width;
    .base-collapse-main {
      width: $layout-sider-collapse-width;
    }
  }

  :deep() {
    .ant-menu {
      color: $font-color3;
      font-size: 16px;
    }

    .ant-menu-submenu-title {
      // font-weight: 600;
      .ant-menu-item-icon {
        width: 14px;
      }
      .ant-menu-title-content {
        margin-left: 8px;
      }
    }
    .ant-menu-submenu-selected {
      .ant-menu-submenu-title {
        color: $font-color3;
      }
    }
    .ant-menu-inline.ant-menu-root {
      border-right: none;
      .ant-menu-submenu-title {
        margin: 0;
        height: 46px;
        line-height: 46px;
      }
      .ant-menu-item {
        padding-left: 52px !important;
        height: 46px;
        line-height: 46px;
        &.ant-menu-item-active,
        &.ant-menu-item-selected {
          background: #ffffff;
          color: $font-color1;
          font-weight: 600;
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
  .base-collapse-main {
    position: absolute;
    bottom: 0;
    left: 0;
    width: $layout-sider-width;
    // background-color: $page-background;
    padding-right: 16px;
    box-shadow: 0px -1px 0px 0px $border-color;
  }
}
</style>
