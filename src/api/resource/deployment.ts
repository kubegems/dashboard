import axios from 'axios';

import { getApiVersion } from '@/utils/helpers';

// deploy列表
export const getDeploymentList = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('deployment', 'apps/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/deployments`, {
    params: query,
  });
};
// deploy详情
export const getDeploymentDetail = (
  clusterName: string,
  namespace: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('deployment', 'apps/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/deployments/${name}`, {
    params: query,
  });
};
// 添加deploy
export const postAddDeployment = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('deployment', 'apps/v1');
  return axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/deployments/${name}`, body);
};
// 更新deploy
export const patchUpdateDeployment = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('deployment', 'apps/v1');
  return axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/deployments/${name}`, body);
};

// 删除deploy
export const deleteDeployment = (
  clusterName: string,
  namespace: string,
  name: string,
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('deployment', 'apps/v1');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/deployments/${name}`);
};
