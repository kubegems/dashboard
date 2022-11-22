import axios from 'axios';

import { getApiVersion } from '@/utils/helpers';

// 密钥列表
export const getSecretList = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/custom/core/v1/namespaces/${namespace}/secrets`, {
    params: query,
  });
// 密钥详情
export const getSecretDetail = (
  clusterName: string,
  namespace: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('secret');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/secrets/${name}`, {
    params: query,
  });
};
// 添加密钥
export const postAddSecret = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('secret');
  return axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/secrets/${name}`, body);
};
// 更新密钥
export const patchUpdateSecret = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('secret');
  return axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/secrets/${name}`, body);
};
// 删除密钥
export const deleteSecret = (clusterName: string, namespace: string, name: string): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('secret');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/secrets/${name}`);
};
