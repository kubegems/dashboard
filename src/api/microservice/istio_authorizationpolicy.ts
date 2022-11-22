import axios from 'axios';

import { getApiVersion } from '@/utils/helpers';

// 认证策略列表
export const getIstioAuthorizationPolicyList = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('authorizationpolicy', 'security.istio.io/v1beta1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/authorizationpolicy`, {
    params: query,
  });
};
// 认证策略详情
export const getIstioAuthorizationPolicyDetail = (
  clusterName: string,
  namespace: string,
  name: string,
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('authorizationpolicy', 'security.istio.io/v1beta1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/authorizationpolicy/${name}`);
};
// 添加认证策略
export const postAddIstioAuthorizationPolicy = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('authorizationpolicy', 'security.istio.io/v1beta1');
  return axios.post(
    `proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/authorizationpolicy/${name}`,
    body,
  );
};
// 更新认证策略
export const patchUpdateIstioAuthorizationPolicy = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('authorizationpolicy', 'security.istio.io/v1beta1');
  return axios.patch(
    `proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/authorizationpolicy/${name}`,
    body,
  );
};
// 删除认证策略
export const deleteIstioAuthorizationPolicy = (
  clusterName: string,
  namespace: string,
  name: string,
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('authorizationpolicy', 'security.istio.io/v1beta1');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/authorizationpolicy/${name}`);
};
