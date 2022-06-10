import axios from 'axios';

// 事件列表
export const getEventList = (clusterName, namespace, query = {}) =>
  axios(`proxy/cluster/${clusterName}/custom/core/v1/namespaces/${namespace}/events`, {
    params: query,
  });
