export const changeProxyUrlWithObject = (data: { [x: string]: any }) => {
  Object.keys(data).forEach((name) => {
    if (typeof data[name] === 'string') {
      data[name] = changeProxyUrl(data[name]);
    }
  });
};

export const changeProxyUrl = (url: string) => {
  if (
    ['/edue-exam-evaluation-resource-svc.', '/edue-exam-evaluation-task-svc.'].some(
      (x) => url.indexOf(x) > -1,
    )
  ) {
    return url.split('.dm-ai.com')[1];
  }
  return url;
};

export const changeProxyBackendUrl = (url: string) => {
  if (['/edue-exam-backend'].some((x) => url.indexOf(x) > -1)) {
    return '/backend-porxy' + url.split('.dm-ai.com')[1];
  }
  return url;
};
