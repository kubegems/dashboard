import axios from 'axios';

// 监控采集器详情
export const getServiceMonitor = (clusterName, namespace, query = {}) =>
  axios.get(`observability/cluster/${clusterName}/namespaces/${namespace}/monitor`, {
    params: query,
  });

// 添加监控采集器
export const postServiceMonitor = (clusterName, namespace, body = {}) =>
  axios.post(`observability/cluster/${clusterName}/namespaces/${namespace}/monitor`, body);

export const getChartSchema = (chartName) => axios(`observability/monitor/exporters/${chartName}/schema`);

export const getServiceMonitorStatus = (clusterName, namespace, query = {}) =>
  axios(`observability/cluster/${clusterName}/namespaces/${namespace}/monitor/status`, {
    params: query,
  });
