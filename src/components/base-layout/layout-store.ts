// https://pinia.vuejs.org/core-concepts/

import { defineStore } from 'pinia';
import { ref } from 'vue';

import store from '@/stores';

import type { ActiveSiderMenuItem } from './interface';

export const useLayoutStore = defineStore('layout', () => {
  const siderActive = ref<ActiveSiderMenuItem>();
  const setSiderActive = (payload: ActiveSiderMenuItem) => {
    siderActive.value = payload;
  };
  return { siderActive, setSiderActive };
});

// Need to be used outside the setup
export const useLayoutStoreNoSetup = () => {
  return useLayoutStore(store);
};

export const useLayoutStoreCommon = (isNoSetup: boolean) => {
  return isNoSetup ? useLayoutStoreNoSetup() : useLayoutStore();
};
