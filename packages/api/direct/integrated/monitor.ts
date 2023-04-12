import axios from 'axios';

// 监控采集器详情
export const getServiceMonitor = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.get(`observability/cluster/${clusterName}/namespaces/${namespace}/monitor`, {
    params: query,
  });

// 添加监控采集器
export const postServiceMonitor = (
  clusterName: string,
  namespace: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.post(`observability/cluster/${clusterName}/namespaces/${namespace}/monitor`, body);

export const getChartSchema = (chartName: string): Promise<{ [key: string]: any }> =>
  axios(`observability/monitor/exporters/${chartName}/schema`);

export const getServiceMonitorStatus = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`observability/cluster/${clusterName}/namespaces/${namespace}/monitor/status`, {
    params: query,
  });
