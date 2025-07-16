<script lang="ts" setup>
import { isNumber } from 'lodash-es';
import { ref } from 'vue';

import { useDownload } from './download';
import DownloadDialog from './download-dialog.vue';
import ListJson from './list-demo.json';

const { downloadStore, download, retryDownload, cancelDownload, closeDownloadDialog } =
  useDownload();

const columns = [
  {
    title: '下载文件',
    dataIndex: 'name',
  },

  {
    title: '操作',
    key: 'action',
    width: 210,
  },
];

type DataItem = any;
const dataSource = ref<DataItem[]>([]);
const getTableData = async () => {
  const res = (await fetchTaskList()) as any;

  dataSource.value = res.data.map((item: any) => {
    return {
      ...item,
      taskName: item.name,
      rowSpan: 0,
      progress: 0,
      downloadState: 'wait',
    };
  });
};

const fetchTaskList = async () => {
  return ListJson;
};

const initTable = async () => {
  getTableData();
};
const init = async () => {
  initTable();
};

init();
</script>
<template>
  <div class="layout-content">
    <div class="layout-content-inner">
      <div class="table-main">
        <a-table
          class="global-th-nowarp"
          :dataSource="dataSource"
          :columns="columns"
          row-key="id"
          :pagination="false"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'name'">
              <a-space :size="16" :align="'center'">
                <img src="@/assets/icons/zip-icon.svg" alt="zip" class="file-icon" />
                <a-space :size="8" direction="vertical">
                  <div class="file-name">{{ record.name }}</div>
                  <a-space :size="8">
                    <span class="file-info"
                      >{{ isNumber(record.size) ? record.size : '--'
                      }}{{ record.sizeUnit ? record.sizeUnit : '' }}</span
                    >
                  </a-space>
                </a-space>
              </a-space>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space :size="16">
                <a-typography-link @click="download(record)">下载</a-typography-link>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </div>
    <DownloadDialog
      :data="downloadStore.downloadList"
      v-if="downloadStore.downloadList?.length"
      @retry="retryDownload"
      @cancel="cancelDownload"
      @closeDialog="closeDownloadDialog"
    ></DownloadDialog>
  </div>
</template>
<style lang="scss" scoped>
.layout-content {
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 20px;
}

.layout-content-inner {
  flex: 1;
}

.layout-content-inner {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  .file-icon {
    width: 36px;
    height: 36px;
  }

  .file-name {
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
    color: #2b345e;
  }

  .file-info {
    font-size: 14px;
    line-height: 22px;
    color: #83889f;
  }
  .danger {
    color: $danger-color;
  }
}
.table-main {
  :deep(.ant-table) {
    .ant-table-thead > tr > th {
      position: sticky;
      top: 0;
      z-index: 1;
    }
  }
}

.text-dot {
  @include text-dot;
  white-space: nowrap;
}
</style>
