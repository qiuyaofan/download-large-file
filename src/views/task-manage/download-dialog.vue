<script lang="ts" setup>
import {
  CheckCircleFilled,
  CloseOutlined,
  DeleteOutlined,
  LoadingOutlined,
  RedoOutlined,
} from '@ant-design/icons-vue';
import Draggable from 'draggable';

import type { DownloadItem } from './download-store';
type DataItem = Pick<DownloadItem, 'name' | 'id' | 'downloadState' | 'progress'>;
export interface Props {
  data: DataItem[];
}
const emit = defineEmits<{
  retry: [DataItem['id']];
  cancel: [DataItem['id']];
  closeDialog: [];
}>();
const props = defineProps<Props>();
const downloadHeaderRef = ref();
const downloadDialogRef = ref();
const initDraggable = () => {
  const ele = downloadDialogRef.value;
  const options = {
    limit: document.body,
    handle: downloadHeaderRef.value,
    // setCursor: true,
    setPosition: false,
  };
  new Draggable(ele, options);
};
onMounted(() => {
  initDraggable();
});
</script>
<template>
  <div class="download-task" ref="downloadDialogRef">
    <div class="header" ref="downloadHeaderRef">
      <div class="title">下载任务列表<span class="tip">（刷新或关闭页面会停止下载）</span></div>
      <close-outlined class="close-icon" @click="emit('closeDialog')" />
    </div>

    <div class="download-list">
      <div class="download-list-inner">
        <div v-for="item in data" :key="item.id" class="download-item">
          <div class="name">{{ item.name }}</div>
          <a-space>
            <template v-if="item.downloadState === 'loading'">
              <loading-outlined /><span>{{ item.progress }}%</span>
            </template>

            <template v-else-if="item.downloadState === 'success'">
              <check-circle-filled class="success-icon" />
            </template>
            <template v-else-if="item.downloadState === 'fail'">
              <span class="fail" title="点击重试" @click="emit('retry', item.id)">
                失败<redo-outlined class="retry-icon" />
              </span>
            </template>

            <template v-if="item.downloadState !== 'success' && item.downloadState !== 'fail'">
              <delete-outlined
                title="取消下载"
                class="cancel-icon"
                @click="emit('cancel', item.id)"
              />
            </template>
          </a-space>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.download-task {
  position: fixed;
  top: 20px;
  left: calc(100vw - 420px);
  // right: 20px;
  z-index: 999;
  background-color: #fff;
  width: 400px;
  box-shadow: 0 3px 6px -4px #0000001f, 0 6px 16px #00000014, 0 9px 28px 8px #0000000d;
  border-radius: 2px;
  .header {
    padding: 16px;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;
    border-radius: 2px 2px 0 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: move;
    .title {
      color: $font-color1;
    }
    .tip {
      color: $font-color3;
      font-size: 12px;
    }
    .close-icon {
      cursor: pointer;
    }
  }
}
.download-list {
  padding: 16px 0 16px 16px;
}
.download-list-inner {
  max-height: 142px;
  min-height: 82px;
  overflow-y: auto;
  padding-right: 16px;
}
.download-item {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  & + .download-item {
    margin-top: 8px;
  }
  .name {
    @include ellipsis;
    width: 260px;
  }
  .success-icon,
  .retry-icon,
  .cancel-icon {
    font-size: 16px;
  }
  .success-icon {
    color: #52c41a;
  }
  .fail {
    cursor: pointer;
    color: #d9363e;
  }
  .retry-icon {
    margin-left: 5px;
  }
  .cancel-icon {
    cursor: pointer;
  }
}
</style>
