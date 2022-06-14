import axios from 'axios';

// 日志历史列表
export const getLogQueryHistoryList = (clusterid, query = {}) =>
  axios(`cluster/${clusterid}/logqueryhistoryv2`, { params: query });
// 添加日志历史
export const postAddLogQueryHistory = (body = {}) => axios.post(`logqueryhistory`, body);
// 删除日志历史
export const deleteLogQueryHistory = (historyIdQuery) => axios.delete(`logqueryhistory?${historyIdQuery}`);
