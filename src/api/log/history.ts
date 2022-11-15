import axios from 'axios';

// 日志历史列表
export const getLogQueryHistoryList = (
  clusterid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`cluster/${clusterid}/logqueryhistoryv2`, { params: query });
// 添加日志历史
export const postAddLogQueryHistory = (body: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.post(`logqueryhistory`, body);
// 删除日志历史
export const deleteLogQueryHistory = (historyIdQuery: string): Promise<{ [key: string]: any }> =>
  axios.delete(`logqueryhistory?${historyIdQuery}`);
