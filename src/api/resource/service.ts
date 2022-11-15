import axios from 'axios';

import { getApiVersion } from 'src/utils/helpers';

// 服务列表
export const getServiceList = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('service');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/services`, {
    params: query,
  });
};
// 服务详情
export const getServiceDetail = (
  clusterName: string,
  namespace: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('service');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/services/${name}`, {
    params: query,
  });
};
// 添加服务
export const postAddService = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('service');
  return axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/services/${name}`, body);
};
// 更新服务
export const patchUpdateService = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('service');
  return axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/services/${name}`, body);
};
// 删除服务
export const deleteService = (
  clusterName: string,
  namespace: string,
  name: string,
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('service');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/services/${name}`);
};
