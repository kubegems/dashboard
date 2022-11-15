import axios from 'axios';

// 事件列表
export const getEventListFromLoki = (
  clusterName: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`event/${clusterName}`, {
    params: query,
  });
