import axios from 'axios';

import { getApiVersion } from '@/utils/helpers';

// 服务监控列表
export const getServiceMonitorList = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('servicemonitor', 'monitoring.coreos.com/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/servicemonitor`, {
    params: query,
  });
};
// 添加服务监控
export const postAddServiceMonitor = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('servicemonitor', 'monitoring.coreos.com/v1');
  return axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/servicemonitor/${name}`, body);
};
// 服务监控详情
export const getServiceMonitorDetail = (
  clusterName: string,
  namespace: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('servicemonitor', 'monitoring.coreos.com/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/servicemonitor/${name}`, {
    params: query,
  });
};
// 更新服务监控
export const patchUpdateServiceMonitor = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('servicemonitor', 'monitoring.coreos.com/v1');
  return axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/servicemonitor/${name}`, body);
};
// 删除服务监控
export const deleteServiceMonitor = (
  clusterName: string,
  namespace: string,
  name: string,
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('servicemonitor', 'monitoring.coreos.com/v1');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/servicemonitor/${name}`);
};
