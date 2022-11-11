import axios from 'axios';

import { getApiVersion } from '@/utils/helpers';

// 颁发者列表
export const getIssuerList = (clusterName, namespace, query = {}) => {
  const apiVersion = getApiVersion('issuer', 'cert-manager.io/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/issuers`, {
    params: query,
  });
};
// 颁发者详情
export const getIssuerDetail = (clusterName, namespace, name) => {
  const apiVersion = getApiVersion('issuer', 'cert-manager.io/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/issuers/${name}`);
};
// 添加颁发者
export const postAddIssuer = (clusterName, namespace, name, body = {}) => {
  const apiVersion = getApiVersion('issuer', 'cert-manager.io/v1');
  return axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/issuers/${name}`, body);
};
// 更新颁发者
export const patchUpdateIssuer = (clusterName, namespace, name, body = {}) => {
  const apiVersion = getApiVersion('issuer', 'cert-manager.io/v1');
  return axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/issuers/${name}`, body);
};
// 删除颁发者
export const deleteIssuer = (clusterName, namespace, name) => {
  const apiVersion = getApiVersion('issuer', 'cert-manager.io/v1');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/issuers/${name}`);
};
