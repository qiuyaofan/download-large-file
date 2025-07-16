import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';

export const downloadFile = (urlOrBlob: Blob | string, fileName: string) => {
  const a = document.createElement('a');
  const isObjectUrl = typeof urlOrBlob !== 'string';
  const downloadUrl = isObjectUrl ? URL.createObjectURL(urlOrBlob) : urlOrBlob;
  a.href = downloadUrl;
  // a.target = '_blank';
  a.download = fileName;
  a.rel = 'noopener noreferrer'; // 安全优化
  a.style.display = 'none';
  document.body.append(a);
  a.click();
  document.body.removeChild(a);
  // 延迟撤销Object URL，否则大文件会导致浏览器崩溃
  if (isObjectUrl) {
    setTimeout(() => {
      URL.revokeObjectURL(downloadUrl);
    }, 1 * 60 * 1000); // 延迟（根据文件大小调整）
  }
};

export const downloadByRequest = async (
  url: string,
  fileName: string,
  options?: AxiosRequestConfig,
) => {
  const response = await axios({
    method: 'get',
    url,
    responseType: 'blob',
    ...options,
  });
  downloadFile(new Blob([response.data]), fileName);
};

// 获取上传的图片的宽高
export const getImgSizeByFile = (
  file: File,
): Promise<null | {
  width: number;
  height: number;
}> => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  return new Promise((resolve) => {
    reader.onload = function (evt) {
      const replaceSrc = evt.target?.result;
      if (!replaceSrc) return resolve(null);
      const imageObj = new Image();
      imageObj.src = replaceSrc as string;
      imageObj.onload = function () {
        // 执行上传的方法，获取外网路径，上传进度等
        resolve({
          width: imageObj.width,
          height: imageObj.height,
        });
      };
    };
  });
};

export const dataBase64toFile = (dataurl: string, filename: string) => {
  const arr = dataurl.split(',');
  const mime = (arr[0] || '').match(/:(.*?);/)?.[1];
  const bstr = atob(arr[arr.length - 1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

// 读取blob里的内容
export const readBlobContent = (blob: Blob, type: 'json' | 'text'): Promise<[null | true, any]> => {
  return new Promise((resolve) => {
    // 创建一个读取器
    const reader = new FileReader();

    reader.onloadend = function () {
      const result = this.result as any; // 这里是字符串形式的JSON
      if (type === 'text') return resolve([null, result]);
      try {
        const jsonData = JSON.parse(result); // 解析后的JSON对象
        return resolve([null, jsonData]);
      } catch (error) {
        return resolve([true, null]);
      }
    };

    reader.readAsText(blob); // 读取Blob作为文本
  });
};
