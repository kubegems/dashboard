import axios from 'axios';

// 支持日志采集的应用及标签
export const getLoggingAppList = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.get(`observability/cluster/${clusterName}/namespaces/${namespace}/logging/apps`, {
    params: query,
  });

// 添加日志采集
export const postLoggingFlow = (
  clusterName: string,
  namespace: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.post(`observability/cluster/${clusterName}/namespaces/${namespace}/logging/apps`, body);

// 添加日志采集(命名空间级别)
export const putLoggingNsFlow = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.put(`observability/cluster/${clusterName}/namespaces/${namespace}/logging`, body, {
    params: query,
  });
