import { message } from 'ant-design-vue';

/**
 * 分片下载文件，分片数据存储在indexedDB。
 * 下载成功直接删除分片数据
 * 下载失败则保留，当关闭下载弹窗后删除，避免占用空间
 */
export interface MetaData {
  id: string;
  url: string;
  name: string;
  size: number;
  totalChunks: number;
  downloadedChunks: number;
  createdAt: Date;
}

export interface DownloadDataItem {
  url: string;
  downloadController: AbortController | null;
  pauseRequested: boolean;
  downloadSpeed: number;
  downloadedSize: number;
}
export interface DownloadOptions {
  dbName: string; // 数据库名称
  minChunkSize: number; //byte 最小分片
  maxRetries: number; // 最大重试次数
  expireTimeMs: number; // 清除db缓存过期时间 毫秒
}
export const useDownloadLargeFile = (options?: DownloadOptions) => {
  // 配置常量
  const DB_NAME = options?.dbName || 'LargeFileDownloader';
  const FILE_STORE = 'files';
  const CHUNK_STORE = 'fileChunks';
  const MIN_CHUNK_SIZE = options?.minChunkSize || 1 * 1024 * 1024; // 块大小
  const CHUNK_SIZE = 1 * 1024 * 1024; // 块大小
  const CHUNK_SIZE_UNIT = 100 * 1024 * 1024; // 块大小
  const MAX_RETRIES = options?.maxRetries || 3;
  const RETRY_DELAY = 1000;
  const EXPIRE_TIME_MS = options?.expireTimeMs || 24 * 60 * 60 * 1000; // 清除db缓存过期时间

  // 全局变量
  let db: any;

  const getInitData = (url = ''): DownloadDataItem => {
    return {
      downloadController: null,
      pauseRequested: false,
      downloadSpeed: 0,
      downloadedSize: 0,
      url,
    };
  };
  // 分片下载过程数据
  const downloadData: DownloadDataItem[] = [];

  // 初始化数据库
  async function initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 3);

      request.onerror = (event: any) => {
        console.error('数据库打开失败:', event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event: any) => {
        db = event.target.result;
        resolve(db);
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;

        // 创建文件元数据存储
        if (!db.objectStoreNames.contains(FILE_STORE)) {
          const store = db.createObjectStore(FILE_STORE, { keyPath: 'id' });
          store.createIndex('url', 'url', { unique: true });
          store.createIndex('name', 'name', { unique: false });
        }

        // 创建文件块存储
        if (!db.objectStoreNames.contains(CHUNK_STORE)) {
          const chunkStore = db.createObjectStore(CHUNK_STORE, { keyPath: 'id' });
          chunkStore.createIndex('fileId', 'fileId', { unique: false });
          chunkStore.createIndex('chunkIndex', 'chunkIndex', { unique: false });
        }
      };
    });
  }

  // 获取文件元数据
  async function getFileMetadata(fileId: string): Promise<MetaData> {
    const transaction = db.transaction([FILE_STORE], 'readonly');
    const store = transaction.objectStore(FILE_STORE);
    return new Promise((resolve, reject) => {
      const request = store.get(fileId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e: any) => reject(e.target.error);
    });
  }

  // 获取所有文件列表
  async function getAllFiles() {
    const transaction = db.transaction([FILE_STORE], 'readonly');
    const store = transaction.objectStore(FILE_STORE);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = (e: any) => reject(e.target.error);
    });
  }

  // 检查URL是否已下载
  async function checkUrlExists(url: string) {
    const transaction = db.transaction([FILE_STORE], 'readonly');
    const store = transaction.objectStore(FILE_STORE);
    const index = store.index('url');
    return new Promise((resolve, reject) => {
      const request = index.get(url);
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e: any) => reject(e.target.error);
    });
  }

  // 保存文件元数据
  async function saveFileMetadata(metadata: MetaData) {
    const transaction = db.transaction([FILE_STORE], 'readwrite');
    const store = transaction.objectStore(FILE_STORE);
    return new Promise((resolve, reject) => {
      const request = store.put(metadata);
      request.onsuccess = () => resolve('');
      request.onerror = (e: any) => reject(e.target.error);
    });
  }

  // 保存文件块
  async function saveFileChunk(fileId: string, chunkIndex: number, data: ArrayBuffer) {
    const transaction = db.transaction([CHUNK_STORE], 'readwrite');
    const store = transaction.objectStore(CHUNK_STORE);
    return new Promise((resolve, reject) => {
      const chunk = {
        id: `${fileId}-${chunkIndex}`,
        fileId: fileId,
        chunkIndex: chunkIndex,
        data: data,
      };

      const request = store.put(chunk);
      request.onsuccess = () => resolve('');
      request.onerror = (e: any) => reject(e.target.error);
    });
  }

  // 获取文件块
  async function getFileChunk(fileId: string, chunkIndex: number): Promise<ArrayBuffer> {
    const transaction = db.transaction([CHUNK_STORE], 'readonly');
    const store = transaction.objectStore(CHUNK_STORE);
    return new Promise((resolve, reject) => {
      const request = store.get(`${fileId}-${chunkIndex}`);
      request.onsuccess = () => resolve(request.result ? request.result.data : null);
      request.onerror = (e: any) => reject(e.target.error);
    });
  }
  const getDownloadData = (url: string) => {
    return downloadData.find((x) => x.url === url);
  };
  // 下载文件块
  async function downloadChunk(
    url: string,
    start: number,
    end: number,
    fileId: string,
    chunkIndex: number,
    retryCount = 0,
  ) {
    const data = getDownloadData(url);
    if (data?.pauseRequested) {
      return null;
    }

    try {
      // 先检查是否已下载过这个块
      const existingChunk = await getFileChunk(fileId, chunkIndex);
      if (existingChunk) {
        return existingChunk;
      }

      const response = await fetch(url, {
        headers: {
          Range: `bytes=${start}-${end}`,
        },
        signal: data?.downloadController?.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      // 保存分片数据到indexedDB
      await saveFileChunk(fileId, chunkIndex, arrayBuffer);

      return arrayBuffer;
    } catch (error) {
      console.error(`下载块 ${chunkIndex} 失败:`, error);

      if (retryCount < MAX_RETRIES && !data?.pauseRequested) {
        console.log(`重试下载块 ${chunkIndex} (${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return downloadChunk(url, start, end, fileId, chunkIndex, retryCount + 1);
      }

      throw error;
    }
  }

  // 获取文件大小
  async function getFileSize(url: string) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentLength = response.headers.get('Content-Length');
      if (!contentLength) {
        throw new Error('无法获取文件大小: Content-Length 头不存在');
      }

      return parseInt(contentLength, 10);
    } catch (error) {
      console.error('获取文件大小失败:', error);
      throw error;
    }
  }
  // 等待
  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  // 获取更多下载数据
  function countProgress(downloaded: number, total: number, speed: number) {
    const percent = Math.round((downloaded / total) * 100);
    const downloadedMB = (downloaded / (1024 * 1024)).toFixed(2);
    const totalMB = (total / (1024 * 1024)).toFixed(2);
    let speedMB = 0; // 下载速度 MB/s
    let remainingSeconds = null; // 下载剩余时间 s
    // 计算下载速度
    if (speed > 0) {
      speedMB = +(speed / (1024 * 1024)).toFixed(2);

      // 计算剩余时间
      if (speed > 0 && percent < 100) {
        const remainingBytes = total - downloaded;
        remainingSeconds = remainingBytes / speed;
      }
    }
    return {
      percent,
      downloadedMB,
      totalMB,
      speedMB,
      remainingSeconds,
    };
  }

  // 暂停下载
  function pauseDownload(url: string) {
    const data = getDownloadData(url);
    if (data) {
      data.pauseRequested = true;
    }
    if (data?.downloadController) {
      data.downloadController.abort();
    }
  }

  // 删除文件
  async function deleteFile(fileId: string) {
    // if (!confirm('确定要删除这个文件吗？此操作不可恢复。')) return;
    try {
      const transaction = db.transaction([FILE_STORE, CHUNK_STORE], 'readwrite');
      const fileStore = transaction.objectStore(FILE_STORE);
      const chunkStore = transaction.objectStore(CHUNK_STORE);

      // 删除文件元数据
      fileStore.delete(fileId);

      // 删除所有相关的文件块
      const index = chunkStore.index('fileId');
      const request = index.openCursor(IDBKeyRange.only(fileId));

      request.onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          chunkStore.delete(cursor.primaryKey);
          cursor.continue();
        }
      };

      await new Promise((resolve, reject) => {
        transaction.oncomplete = resolve;
        transaction.onerror = (e: any) => reject(e.target.error);
      });
    } catch (error) {
      console.error('删除文件失败:', error);
      message.error('删除文件失败');
    }
  }

  async function deleteFileWithUrl(url: string) {
    const info = (await checkUrlExists(url)) as any;
    if (info && info.id) {
      await deleteFile(info.id);
    }
  }

  // 下载文件到电脑
  async function downloadFileToLocal(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);

    // 触发下载
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener noreferrer'; // 安全优化
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    // 清理
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // 合并分片数据，并下载文件到电脑
  async function streamMergeAndDownload(fileId: string) {
    try {
      const metadata = await getFileMetadata(fileId);
      if (!metadata) throw new Error('文件不存在');

      // 创建文件流
      const fileStream = new ReadableStream({
        async start(controller) {
          for (let i = 0; i < metadata.totalChunks; i++) {
            // 获取所有分片数据
            const chunk = await getFileChunk(fileId, i);
            if (!chunk) throw new Error(`缺少chunk ${i}`);
            // 将给定数据块送入到关联的流中
            controller.enqueue(new Uint8Array(chunk));
          }
          controller.close();
        },
      });

      // 创建响应对象
      const response = new Response(fileStream, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(metadata.name)}"`,
          'Content-Length': metadata.size.toString(),
        },
      });

      // 创建Blob URL
      const blob = await response.blob();
      // 下载文件到本地
      downloadFileToLocal(blob, metadata.name);
    } catch (error: any) {
      console.error('流式合并失败:', error);
      throw error;
      //   message.error('文件下载失败: ' + error.message);
    }
  }

  // 下载文件
  async function downloadLargeFile(
    url: string,
    fileName: string,
    options?: {
      updateProgress?: (downloaded: number, total: number, speed: number) => void;
    },
  ) {
    if (!db) {
      await initDB();
    }

    // 检查是否已下载
    const existingFile = (await checkUrlExists(url)) as any;
    if (existingFile) {
      // 文件已下载完成过，则直接下载到浏览器
      if (existingFile.totalChunks === existingFile.downloadedChunks) {
        console.info('删除历史数据!');
        await deleteFile(existingFile.id);
      }
    }

    let data = getDownloadData(url) as DownloadDataItem;
    if (!data) {
      data = getInitData(url);
      downloadData.push(data);
    }
    let metadata: MetaData;
    const resetMetadata = async () => {};
    try {
      // 获取文件大小
      const fileSize = await getFileSize(url);
      // 因为文件越大，分片太多会影响速度，所以做了动态计算分片大小
      const chunkSize = Math.max(
        MIN_CHUNK_SIZE,
        Math.round(fileSize / CHUNK_SIZE_UNIT) * CHUNK_SIZE,
      );
      const totalChunks = Math.ceil(fileSize / chunkSize);
      const fileId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      // 创建文件记录
      metadata = {
        id: fileId,
        url: url,
        name: fileName,
        size: fileSize,
        totalChunks: totalChunks,
        downloadedChunks: 0,
        createdAt: new Date(),
      };
      if (existingFile) {
        if (existingFile.size !== fileSize) {
          await deleteFile(existingFile.id);
        } else {
          //   fileId = existingFile.id;
          metadata.id = existingFile.id;
          metadata.downloadedChunks = existingFile.downloadedChunks;
          metadata.createdAt = new Date();
        }
      }

      await saveFileMetadata(metadata);

      // 创建AbortController以便可以取消下载
      data.downloadController = new AbortController();
      data.pauseRequested = false;

      // 计算下载速度
      let lastUpdateTime = Date.now();
      let lastDownloaded = 0;

      // 下载每个块
      let downloadedSize = 0;
      for (let i = 0; i < totalChunks; i++) {
        if (data.pauseRequested) break;

        const start = i * chunkSize;
        const end = Math.min(start + chunkSize - 1, fileSize - 1);

        // 下载块
        const chunk = (await downloadChunk(url, start, end, metadata.id, i)) as ArrayBuffer;
        if (!chunk) break; // 暂停时返回null

        downloadedSize += chunk.byteLength;

        // 更新元数据中的已下载块数
        metadata.downloadedChunks = i + 1;
        await saveFileMetadata(metadata);

        // 计算下载速度 (每秒更新一次)
        const now = Date.now();
        const timeDiff = (now - lastUpdateTime) / 1000; // 转换为秒
        if (timeDiff >= 1) {
          const bytesDiff = downloadedSize - lastDownloaded;
          data.downloadSpeed = bytesDiff / timeDiff;

          lastUpdateTime = now;
          lastDownloaded = downloadedSize;
        }

        // 更新进度
        if (options?.updateProgress) {
          options.updateProgress(downloadedSize, fileSize, data.downloadSpeed);
        }
      }

      if (data.pauseRequested) {
        console.info('下载已暂停');
        resetMetadata();
      } else if (downloadedSize === fileSize) {
        console.info('下载完成!');
        await streamMergeAndDownload(metadata.id);
        await sleep(3000);
        await deleteFile(metadata.id);
      } else {
        resetMetadata();
        console.info('下载未完成');
      }
    } catch (error: any) {
      console.error('下载失败:', error);
      resetMetadata();
      throw error;
    } finally {
      if (data) {
        data.downloadController = null;
      }
    }
  }

  async function checkDb() {
    if (!db) {
      await initDB();
    }
    try {
      // 过期删除缓存
      const now = new Date().getTime();
      const files = (await getAllFiles()) as MetaData[];
      files.forEach((file) => {
        if (now - file.createdAt.getTime() > EXPIRE_TIME_MS) {
          deleteFile(file.id);
          console.info('过期删除缓存');
        }
      });
    } catch (err) {
      console.error(err);
    }
  }
  checkDb();
  return {
    downloadLargeFile,
    pauseDownload,
    deleteFile,
    deleteFileWithUrl,
    countProgress,
  };
};
