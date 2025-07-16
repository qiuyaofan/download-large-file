export const useSetInterval = () => {
  let timer: any;
  const setIntervalFn = (fn: () => any, ms: number) => {
    clearTimer();
    timer = setInterval(fn, ms);
  };
  const clearTimer = () => {
    if (timer) {
      clearInterval(timer);
    }
  };
  onBeforeUnmount(() => {
    clearTimer();
  });
  return {
    timer,
    setIntervalFn,
    clearTimer,
  };
};

export const useSetTimeOut = () => {
  let timer: any;

  const setTimeoutFn = (fn: () => any, ms: number) => {
    timer = setTimeout(fn, ms);
  };
  const clearTimer = () => {
    if (timer) {
      clearTimeout(timer);
    }
  };
  return {
    timer,
    setTimeoutFn,
    clearTimer,
  };
};
