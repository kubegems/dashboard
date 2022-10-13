import axios from 'axios';

import { getApiVersion } from '@/utils/helpers';

// 服务列表
export const getServiceList = (clusterName, namespace, query = {}) => {
  const apiVersion = getApiVersion('service');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/services`, {
    params: query,
  });
};
// 服务详情
export const getServiceDetail = (clusterName, namespace, name, query = {}) => {
  const apiVersion = getApiVersion('service');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/services/${name}`, {
    params: query,
  });
};
// 添加服务
export const postAddService = (clusterName, namespace, name, body = {}) => {
  const apiVersion = getApiVersion('service');
  return axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/services/${name}`, body);
};
// 更新服务
export const patchUpdateService = (clusterName, namespace, name, body = {}) => {
  const apiVersion = getApiVersion('service');
  return axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/services/${name}`, body);
};
// 删除服务
export const deleteService = (clusterName, namespace, name) => {
  const apiVersion = getApiVersion('service');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/services/${name}`);
};
