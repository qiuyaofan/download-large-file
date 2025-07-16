<template>
  <a-layout-header class="layout-header">
    <div class="header-main" ref="layoutHeader">
      <a-space :size="10">
        <img src="@/assets/images/logo.png" alt="logo" class="logo" />
        <div class="logo-name">大文件下载平台</div>
      </a-space>
    </div>
  </a-layout-header>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.logo {
  height: 26px;
}

.layout-header {
  height: $layout-header;
  padding: 0;
  // box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.08);
  z-index: 999;
}

.header-main {
  position: relative;
  width: 100%;
  height: $layout-header;
  padding: 0 34px 0 24px;
  text-align: right;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;

  font-size: 14px;
  font-weight: normal;
  line-height: 22px;
  letter-spacing: 0.02em;
  box-shadow: 0px 2px 4px 0px rgba(115, 133, 164, 0.1);

  .logo-name {
    font-size: 16px;
    font-weight: 600;
    color: $font-color1;
    cursor: pointer;
  }
}
</style>
