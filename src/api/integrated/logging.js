import axios from 'axios';

// 支持日志采集的应用及标签
export const getLoggingAppList = (clusterName, namespace, query = {}) =>
  axios.get(`observability/cluster/${clusterName}/namespaces/${namespace}/logging/apps`, {
    params: query,
  });

// 添加日志采集
export const postLoggingFlow = (clusterName, namespace, body = {}) =>
  axios.post(`observability/cluster/${clusterName}/namespaces/${namespace}/logging/apps`, body);

// 添加日志采集(命名空间级别)
export const putLoggingNsFlow = (clusterName, namespace, query = {}, body = {}) =>
  axios.put(`observability/cluster/${clusterName}/namespaces/${namespace}/logging`, body, {
    params: query,
  });
