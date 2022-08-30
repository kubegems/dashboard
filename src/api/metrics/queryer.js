import axios from 'axios';

// 指标查询
export const getMetrics = (clusterName, query = {}) =>
  axios.get(`proxy/cluster/${clusterName}/custom/prometheus/v1/labelvalues`, { params: query });

// // 监控标签值
// export const getMetricsLabelValues = (query = {}) => axios.get('/metrics/labelvalues', { params: query })

// 指标查询
export const getMetricsQueryrange = (clusterName, namespace, query = {}) =>
  axios.get(`observability/cluster/${clusterName}/namespaces/${namespace}/monitor/metrics/queryrange`, {
    params: query,
  });

// 获取指标标签列表
export const getMetricsLabels = (clusterName, namespace, query = {}) =>
  axios.get(`observability/cluster/${clusterName}/namespaces/${namespace}/monitor/metrics/labelnames`, {
    params: query,
  });

// 获取指标标签值列表
export const getMetricsLabelValues = (clusterName, namespace, query = {}) =>
  axios.get(`observability/cluster/${clusterName}/namespaces/${namespace}/monitor/metrics/labelvalues`, {
    params: query,
  });
