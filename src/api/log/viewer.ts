import axios from 'axios';

// 日志标签
export const getLogLabels = (
  clusterName: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`log/${clusterName}/labels`, { params: query, timeout: 60 * 1000 });
// 日志查询
export const getLogQueryRange = (
  clusterName: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`log/${clusterName}/queryrange`, { params: query, timeout: 60 * 1000 });
// 日志导出
export const getLogExport = (
  clusterName: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`log/${clusterName}/export`, { params: query, timeout: 60 * 1000 });
// 日志上下文
export const getLogContext = (
  clusterName: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`log/${clusterName}/context`, { params: query, timeout: 60 * 1000 });
// 日志样本
export const getLogSeries = (
  clusterName: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`log/${clusterName}/series`, { params: query, timeout: 60 * 1000 });
