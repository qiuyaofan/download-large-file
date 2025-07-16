<template>
  <a-config-provider
    :locale="zhCN"
    :theme="{
      token: THEME,
    }"
  >
    <base-layout />
  </a-config-provider>
</template>

<script lang="ts" setup>
import zhCN from 'ant-design-vue/es/locale/zh_CN';

import { THEME } from '@/constants/theme';
</script>

<style></style>
