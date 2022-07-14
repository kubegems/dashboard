import axios from 'axios';

// 事件列表
export const getEventListFromLoki = (clusterName, query = {}) =>
  axios(`event/${clusterName}`, {
    params: query,
  });
