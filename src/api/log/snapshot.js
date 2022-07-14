import axios from 'axios';

// 日志快照列表
export const getLogQuerySnapshotList = (clusterid, query = {}) =>
  axios(`cluster/${clusterid}/logquerysnapshot`, { params: query });
// 添加日志快照
export const postAddLogQuerySnapshot = (body = {}) => axios.post(`logquerysnapshot`, body);
// 删除日志快照
export const deleteLogQuerySnapshot = (snapshotid) => axios.delete(`logquerysnapshot/${snapshotid}`);
