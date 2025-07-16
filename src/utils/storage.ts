import { name } from '@/../package.json';

const STORAGE_NAMESPCAE = name;

const getNamespaceData = () => {
  try {
    const getItem = localStorage.getItem(STORAGE_NAMESPCAE);
    if (typeof getItem === 'string') return JSON.parse(getItem);
    else return null;
  } catch (err) {
    return null;
  }
};

const setNamespaceData = (value: any) => {
  localStorage.setItem(STORAGE_NAMESPCAE, JSON.stringify(value));
};

export const getStorage = (key: string) => {
  const data = getNamespaceData();
  if (data) return getNamespaceData()[key];
  else return null;
};
export const setStorage = (key: string, value: any) => {
  const data = getNamespaceData() || {};
  data[key] = value;
  setNamespaceData(data);
};
export const removeStorage = (key: string) => {
  setStorage(key, undefined);
};
