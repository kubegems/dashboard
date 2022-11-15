import axios from 'axios';

// 事件列表
export const getEventList = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/custom/core/v1/namespaces/${namespace}/events`, {
    params: query,
  });
