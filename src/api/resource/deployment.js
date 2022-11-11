import axios from 'axios';

import { getApiVersion } from '@/utils/helpers';

// deploy列表
export const getDeploymentList = (clusterName, namespace, query = {}) => {
  const apiVersion = getApiVersion('deployment', 'apps/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/deployments`, {
    params: query,
  });
};
// deploy详情
export const getDeploymentDetail = (clusterName, namespace, name, query = {}) => {
  const apiVersion = getApiVersion('deployment', 'apps/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/deployments/${name}`, {
    params: query,
  });
};
// 添加deploy
export const postAddDeployment = (clusterName, namespace, name, body = {}) => {
  const apiVersion = getApiVersion('deployment', 'apps/v1');
  return axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/deployments/${name}`, body);
};
// 更新deploy
export const patchUpdateDeployment = (clusterName, namespace, name, body = {}) => {
  const apiVersion = getApiVersion('deployment', 'apps/v1');
  return axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/deployments/${name}`, body);
};

// 删除deploy
export const deleteDeployment = (clusterName, namespace, name) => {
  const apiVersion = getApiVersion('deployment', 'apps/v1');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/deployments/${name}`);
};
