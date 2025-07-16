# 大文件下载

## 主要功能点

- 下载任务使用队列，控制并行下载个数
- 分片下载，断点续传
- 数据存储 indexDB，避免内存过大
- 支持停止下载、进度显示等

## 队列

用户点击下载后，会将下载任务添加到队列中，如果当前运行任务个数少于最大个数，则执行；否则加入队列等待。
等待其他任务执行完，则获取队列中的任务执行。

```js
/* src/utils/queue.ts */
export interface QueueOptions {
  timeout?: number; // ms
  max?: number;
}
export class Queue {
  private _count: number = 0;
  private _taskList: Array<{ task: Function; id: string }> = [];
  private _max: number = 1;// 并行执行任务个数
  private _timeout: number = 30 * 60 * 1000; // 单个任务执行超时时间
  constructor(options?: QueueOptions) {
    if (options?.max || options?.max === 0) {
      this._max = options.max;
    }
    if (options?.timeout) {
      this._timeout = options.timeout;
    }

    this._count = 0;
    this._taskList = [];
  }
  // 添加任务
  trigger(fn: Function, params: any, id: string = '') {
    return new Promise((res, rej) => {
      const task = this._execute(fn, params, res, rej);
      // 运行的任务不超过最大个数，则运行
      if (this._count < this._max) {
        task();
      } else {
        // 否则入队列
        this._taskList.push({ task, id });
      }
    });
  }
  // 运行
  _execute(fn: Function, params: any, res: any, rej: any) {
    return () => {
      this._count++;
      let executeFlag = true;
      const timer = setTimeout(() => {
        console.error('queue-warning: 任务执行超时');
        clearTimeout(timer);
        this._count > 0 && this._count--;
        executeFlag = false;
        rej(new Error('任务执行超时'));
        this._next();
      }, this._timeout);
      fn(params)
        .then(res)
        .catch(rej)
        .finally(() => {
          this._count > 0 && this._count--;
          clearTimeout(timer);
          if (executeFlag) {
            this._next();
          }
        });
    };
  }
  // 下一个任务
  _next() {
    if (this._taskList.length > 0) {
      const taskItem = this._taskList.shift();
      taskItem && taskItem.task && taskItem.task();
    }
  }
  // 取消任务
  cancel(id: string) {
    if (!id) return;
    this._taskList = this._taskList.filter((x) => x.id !== id);
  }
}

```

## 分片下载

### 主要逻辑

- 获取文件大小
- 根据想要的分片大小，计算分片个数
- 请求分片数据
- 计算分片进度
- 下载成功后，合并分片数据，并下载到本地

```js
// download.ts
async function downloadLargeFile(
    url: string,
    fileName: string
  ) {
      // 获取文件大小
      const fileSize = await getFileSize(url);
      const totalChunks = Math.ceil(fileSize / chunkSize);
      // ... 存储文件数据到indexedDB
      // 下载每个块
      let downloadedSize = 0;
      let downloadedChunks = 0;
      let downloadSpeed = 0;
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize - 1, fileSize - 1);

        // 下载块
        const chunk = (await downloadChunk(url, start, end, id, i)) as ArrayBuffer;
        if (!chunk) break; // 暂停时返回null

        downloadedSize += chunk.byteLength;

        // 更新元数据中的已下载块数
        downloadedChunks = i + 1;

        // ... 更新已下载块数到indexedDB的文件数据

        // 计算下载速度 (每秒更新一次)
        const now = Date.now();
        const timeDiff = (now - lastUpdateTime) / 1000; // 转换为秒
        if (timeDiff >= 1) {
          const bytesDiff = downloadedSize - lastDownloaded;
          downloadSpeed = bytesDiff / timeDiff;

          lastUpdateTime = now;
          lastDownloaded = downloadedSize;
        }

        // 更新进度
        if (options?.updateProgress) {
          options.updateProgress(downloadedSize, fileSize, downloadSpeed);
        }
      }

      if (data.pauseRequested) {
        console.info('下载已暂停');
      } else if (downloadedSize === fileSize) {
        console.info('下载完成!');
        // 合并分片并下载到电脑
        await streamMergeAndDownload(metadata.id);
        await sleep(3000);
        // 成功后，删除对应存储在indexedDB的数据
        await deleteFile(metadata.id);
      } else {
        console.info('下载未完成');
      }
    }
  }
```

### 分片请求实现

- 分片实现请求分片范围的数据，需要添加 Range 头部
- 实现停止下载逻辑，需要请求设置 signal 参数为 AbortController，停止下载使用 new AbortController().abort();
- 当分片失败时，添加重试操作，增大下载成功概率

```js
// download.ts
async function downloadChunk(
  url: string,
  start: number,
  end: number,
  fileId: string,
  chunkIndex: number,
  retryCount = 0,
) {
  try {
    // 先检查是否已下载过这个块，如果已下载则直接返回（断点续传逻辑）
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
```

### 合并分片

- 将请求的所有分片，送到关联的 ReadableStream 流中
- 使用 Response 创建响应对象
- 得到 blob，下载文件到本地

```js
// download.ts
async function streamMergeAndDownload(fileId: string) {
    try {
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
    }
  }
```

## 使用 indexedDB

数据保存到 indexedDB 的好处

- indexedDB 是浏览器内置的持久化数据库，数据存储在磁盘上，而变量存储在内存中，在数据量大的时候，存储到 indexedDB 可以避免卡顿。
- indexedDB 的持久化，可以实现刷新页面后仍可以使用断点续传功能。缺点是需要设置清除的机制

```js
// 初始化数据库
async function initDB() {
  return new Promise((resolve, reject) => {
    // 打开我们的数据库
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
        // 创建并返回一个新的 文件 object store。
        const store = db.createObjectStore(FILE_STORE, { keyPath: 'id' });
        // 设置url唯一
        store.createIndex('url', 'url', { unique: true });
        store.createIndex('name', 'name', { unique: false });
      }

      // 创建文件块存储
      if (!db.objectStoreNames.contains(CHUNK_STORE)) {
        // 分片 store
        const chunkStore = db.createObjectStore(CHUNK_STORE, { keyPath: 'id' });
        chunkStore.createIndex('fileId', 'fileId', { unique: false });
        chunkStore.createIndex('chunkIndex', 'chunkIndex', { unique: false });
      }
    };
  });
}
```

以下为使用 indexedDB 获取和保存文件块的逻辑代码

```js
// db存储和获取
// 获取文件块
async function getFileChunk(fileId: string, chunkIndex: number): Promise<ArrayBuffer> {
  // 获取分片事务
  const transaction = db.transaction([CHUNK_STORE], 'readonly');
  // 获取分片的对象存储
  const store = transaction.objectStore(CHUNK_STORE);
  return new Promise((resolve, reject) => {
    // 返回指定的分片id选中的存储对象
    const request = store.get(`${fileId}-${chunkIndex}`);
    request.onsuccess = () => resolve(request.result ? request.result.data : null);
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
    // 保存分片
    const request = store.put(chunk);
    request.onsuccess = () => resolve('');
    request.onerror = (e: any) => reject(e.target.error);
  });
}
```

## 完整代码示例

还有许多交互细节和实现，放在 github 上，可以点击前往查看 [https://github.com/qiuyaofan/download-large-file](https://github.com/qiuyaofan/download-large-file)

例子为 vue3 的，如果是其他语言可以只看 js 部分

## 其他说明

- 下载链接需要支持跨域，否则需要配置代理
- 如果下载的文件每个都几个 G，同时使用了 nginx 代理的话，记得配置大一点的临时文件存储参数。proxy_max_temp_file_size 10240M;否则会下载失败。
