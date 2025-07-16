<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</template>

<script lang="ts" setup>
// 不使用任何布局
</script>

<style lang="scss"></style>
