import axios from 'axios';

// 环境指标统计
export const getEnvironmentObservability = (environmentId, query = {}) =>
  axios.get(`/environment/${environmentId}/observability`, { params: query });
