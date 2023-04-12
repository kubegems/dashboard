import { getApiVersion } from '@kubegems/libs/utils/helpers';
import axios from 'axios';

// 颁发者列表
export const getIssuerList = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('issuer', 'cert-manager.io/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/issuers`, {
    params: query,
  });
};
// 颁发者详情
export const getIssuerDetail = (
  clusterName: string,
  namespace: string,
  name: string,
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('issuer', 'cert-manager.io/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/issuers/${name}`);
};
// 添加颁发者
export const postAddIssuer = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('issuer', 'cert-manager.io/v1');
  return axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/issuers/${name}`, body);
};
// 更新颁发者
export const patchUpdateIssuer = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('issuer', 'cert-manager.io/v1');
  return axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/issuers/${name}`, body);
};
// 删除颁发者
export const deleteIssuer = (clusterName: string, namespace: string, name: string): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('issuer', 'cert-manager.io/v1');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/issuers/${name}`);
};
