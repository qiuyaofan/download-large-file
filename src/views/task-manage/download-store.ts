import { defineStore } from 'pinia';
import { ref } from 'vue';

import store from '@/stores';
import { Queue } from '@/utils';

// export type DownloadState = 'loading' | 'success' | 'fail' | 'wait';
export enum DownloadState {
  Loading = 'loading',
  Success = 'success',
  Fail = 'fail',
  Wait = 'wait',
}
export interface DownloadItem {
  name: string;
  id: string;
  downloadState: DownloadState;
  progress: number;
  downloadUrl: string;
  proxyDownloadUrl: string;
  controller?: AbortController;
}
export type DownloadList = DownloadItem[];
const downloadQueue = new Queue({
  timeout: 1000 * 60 * 60, // 单个队列过期时间：1小时
});
export const useDownloadStore = defineStore('download', () => {
  const downloadList = ref<DownloadList>([]);

  const setDownloadList = (payload: DownloadList) => {
    downloadList.value = payload;
  };
  const clearAll = () => {
    downloadList.value = [];
  };
  return {
    downloadList,
    setDownloadList,
    clearAll,
    downloadQueue,
  };
});

// Need to be used outside the setup
export const useDownloadStoreNoSetup = () => {
  return useDownloadStore(store);
};

export const useDownloadrStoreCommon = (isNoSetup: boolean) => {
  return isNoSetup ? useDownloadStoreNoSetup() : useDownloadStore();
};
