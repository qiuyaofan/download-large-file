import { omit } from 'lodash-es';

import { changeProxyUrl } from '@/utils';

import { useDownloadLargeFile } from './download-large-file';
import {
  type DownloadItem,
  type DownloadList,
  DownloadState,
  useDownloadStore,
} from './download-store';

export const useDownload = () => {
  // 下载任务列表存储到store，切换页面等可以继续下载，切回来继续显示列表
  const downloadStore = useDownloadStore();
  // 文件流请求和文件下载
  const { downloadLargeFile, countProgress, pauseDownload, deleteFileWithUrl } =
    useDownloadLargeFile();
  const { setDownloadList, downloadQueue } = downloadStore;
  const isDownloadSuccess = () =>
    downloadStore.downloadList.every(
      (x: DownloadItem) => x.downloadState === DownloadState.Success,
    );
  // 添加下载队列
  const addDownloadQueue = async (taskItem: DownloadItem) => {
    // 开始下载文件
    const currentTask = downloadStore.downloadList.find((x) => x.id === taskItem.id);
    if (!currentTask) return;
    const handleFail = () => {
      pauseDownload(changeProxyUrl(taskItem.downloadUrl));
      currentTask.downloadState = DownloadState.Fail;
    };
    try {
      await downloadQueue.trigger(
        async () => {
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
            await downloadLargeFile(
              changeProxyUrl(taskItem.downloadUrl),
              taskItem.name + taskItem.suffix,
              options,
            );
            currentTask.downloadState = DownloadState.Success;
          } catch (err) {
            console.error(err);
            handleFail();
          }
        },
        null,
        taskItem.id,
      );
    } catch (err) {
      console.error(err);
      handleFail();
    }
    // 完成全部任务下载
    if (isDownloadSuccess()) {
      setDownloadList([]);
    }
  };
  // 添加下载任务队列
  const addDownloadQueues = (taskItemList: any[]) => {
    taskItemList.forEach(addDownloadQueue);
  };
  // 点击下载
  const download = (
    record: DownloadItem & {
      taskItemList: DownloadList;
    },
  ) => {
    batchDownload({
      taskItemList: [omit(record, 'taskItemList')],
    });
  };
  // 点击批量下载
  const batchDownload = (record: { taskItemList: DownloadList }) => {
    setDownloadList(downloadStore.downloadList.concat(record.taskItemList));
    addDownloadQueues(record.taskItemList);
  };
  // 下载重试
  const retryDownload = (id: string) => {
    const currentTask = downloadStore.downloadList.find((x) => x.id === id);
    if (!currentTask) {
      return;
    }
    currentTask.downloadState = DownloadState.Wait;
    currentTask.progress = 0;
    addDownloadQueues([currentTask]);
  };
  // 取消下载
  const cancelDownload = (id: string) => {
    downloadQueue.cancel(id);
    const currentTask = downloadStore.downloadList.find((x) => x.id === id);
    if (!currentTask) {
      return;
    }
    const url = changeProxyUrl(currentTask.downloadUrl);
    pauseDownload(url);
    deleteFileWithUrl(url);
    setDownloadList(downloadStore.downloadList.filter((x) => x.id !== id));
  };
  // 关闭下载弹窗
  const closeDownloadDialog = () => {
    downloadStore.downloadList.forEach((x) => {
      downloadQueue.cancel(x.id);
      const url = changeProxyUrl(x.downloadUrl);
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
