import axios from 'axios';

// 日志快照列表
export const getLogQuerySnapshotList = (
  clusterid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`cluster/${clusterid}/logquerysnapshot`, { params: query });
// 添加日志快照
export const postAddLogQuerySnapshot = (body: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.post(`logquerysnapshot`, body);
// 删除日志快照
export const deleteLogQuerySnapshot = (snapshotid: number): Promise<{ [key: string]: any }> =>
  axios.delete(`logquerysnapshot/${snapshotid}`);
