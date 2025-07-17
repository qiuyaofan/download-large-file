import { message } from 'ant-design-vue';

import { Queue } from '@/utils';

import { useDownloadLargeFile } from './download-large-file';
import {
  type DownloadItem,
  type DownloadList,
  DownloadState,
  useDownloadStore,
} from './download-store';

// 实例化
const downloadQueue = new Queue({
  timeout: 1000 * 60 * 60, // 单个队列过期时间：1小时
  max: 2, // 最大同步下载个数
});
export const useDownload = () => {
  // 下载任务列表存储到store，切换页面等可以继续下载，切回来继续显示列表
  const downloadStore = useDownloadStore();
  // 文件流请求和文件下载
  const { downloadLargeFile, countProgress, pauseDownload, deleteFileWithUrl } =
    useDownloadLargeFile();
  const { setDownloadList } = downloadStore;
  const isDownloadSuccess = () =>
    downloadStore.downloadList.every(
      (x: DownloadItem) => x.downloadState === DownloadState.Success,
    );
  // 添加下载队列
  const addDownloadQueue = async (taskItem: DownloadItem) => {
    const currentTask = downloadStore.downloadList.find((x) => x.id === taskItem.id);
    if (!currentTask) return;
    // 下载失败处理
    const handleFail = () => {
      // 停止下载请求
      pauseDownload(taskItem.downloadUrl);
      // 设置下载状态为失败
      currentTask.downloadState = DownloadState.Fail;
    };
    try {
      const handleDownloadFile = async () => {
        currentTask.downloadState = DownloadState.Loading;
        currentTask.progress = 0;
        try {
          const options = {
            // 更新进度
            updateProgress: (downloaded: number, total: number, speed: number) => {
              const { percent } = countProgress(downloaded, total, speed);
              currentTask.progress = Math.ceil(percent);
            },
          };
          // 请求文件并下载
          await downloadLargeFile(taskItem.downloadUrl, taskItem.name + taskItem.suffix, options);
          // 设置下载状态为成功
          currentTask.downloadState = DownloadState.Success;
        } catch (err) {
          console.error(err);
          handleFail();
        }
      };
      await downloadQueue.trigger(handleDownloadFile, null, taskItem.id);
    } catch (err) {
      console.error(err);
      handleFail();
    }
    // 完成全部任务下载
    if (isDownloadSuccess()) {
      // 清空下载任务
      setDownloadList([]);
    }
  };

  // 点击下载
  const download = (record: DownloadItem) => {
    const isExit = downloadStore.downloadList.find((x) => x.id === record.id);
    if (isExit) {
      return message.error('下载任务已存在，请勿重复下载！');
    }
    downloadStore.downloadList.push({ ...record });
    addDownloadQueue(record);
  };
  // 点击批量下载
  const batchDownload = (record: DownloadList) => {
    record.forEach((x) => download(x));
  };
  // 下载重试
  const retryDownload = (id: string) => {
    const currentTask = downloadStore.downloadList.find((x) => x.id === id);
    if (!currentTask) {
      return;
    }
    currentTask.downloadState = DownloadState.Wait;
    currentTask.progress = 0;
    addDownloadQueue(currentTask);
  };
  // 取消下载
  const cancelDownload = (id: string) => {
    downloadQueue.cancel(id);
    const currentTask = downloadStore.downloadList.find((x) => x.id === id);
    if (!currentTask) {
      return;
    }
    const url = currentTask.downloadUrl;
    pauseDownload(url);
    deleteFileWithUrl(url);
    setDownloadList(downloadStore.downloadList.filter((x) => x.id !== id));
  };
  // 关闭下载弹窗
  const closeDownloadDialog = () => {
    downloadStore.downloadList.forEach((x) => {
      downloadQueue.cancel(x.id);
      const url = x.downloadUrl;
      pauseDownload(url);
      deleteFileWithUrl(url);
    });
    setDownloadList([]);
  };

  return {
    downloadStore,
    download,
    batchDownload,
    retryDownload,
    cancelDownload,
    closeDownloadDialog,
  };
};
