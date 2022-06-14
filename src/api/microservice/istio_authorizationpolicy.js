import axios from 'axios';

import { jsonParse } from '@/utils/helpers';

const apiResources = jsonParse(window.localStorage.getItem('api-resources')) || {};
let apiVersion = apiResources['authorizationpolicy'] || 'security.istio.io/v1beta1';
apiVersion = apiVersion === 'v1' ? 'core/v1' : apiVersion;

// 认证策略列表
export const getIstioAuthorizationPolicyList = (clusterName, namespace, query = {}) =>
  axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/authorizationpolicy`, {
    params: query,
  });
// 认证策略详情
export const getIstioAuthorizationPolicyDetail = (clusterName, namespace, name) =>
  axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/authorizationpolicy/${name}`);
// 添加认证策略
export const postAddIstioAuthorizationPolicy = (clusterName, namespace, name, body = {}) =>
  axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/authorizationpolicy/${name}`, body);
// 更新认证策略
export const patchUpdateIstioAuthorizationPolicy = (clusterName, namespace, name, body = {}) =>
  axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/authorizationpolicy/${name}`, body);
// 删除认证策略
export const deleteIstioAuthorizationPolicy = (clusterName, namespace, name) =>
  axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/authorizationpolicy/${name}`);
