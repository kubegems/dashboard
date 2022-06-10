import axios from 'axios';

// 日志标签
export const getLogLabels = (clusterName, query = {}) =>
  axios(`log/${clusterName}/labels`, { params: query, timeout: 60 * 1000 });
// 日志查询
export const getLogQueryRange = (clusterName, query = {}) =>
  axios(`log/${clusterName}/queryrange`, { params: query, timeout: 60 * 1000 });
// 日志导出
export const getLogExport = (clusterName, query = {}) =>
  axios(`log/${clusterName}/export`, { params: query, timeout: 60 * 1000 });
// 日志上下文
export const getLogContext = (clusterName, query = {}) =>
  axios(`log/${clusterName}/context`, { params: query, timeout: 60 * 1000 });
// 日志样本
export const getLogSeries = (clusterName, query = {}) =>
  axios(`log/${clusterName}/series`, { params: query, timeout: 60 * 1000 });
