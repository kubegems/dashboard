import axios from 'axios';

import { jsonParse } from '@/utils/helpers';

const apiResources = jsonParse(window.localStorage.getItem('api-resources')) || {};
let apiVersion = apiResources['issuer'] || 'cert-manager.io/v1';
apiVersion = apiVersion === 'v1' ? 'core/v1' : apiVersion;

// 颁发者列表
export const getIssuerList = (clusterName, namespace, query = {}) =>
  axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/issuers`, {
    params: query,
  });
// 颁发者详情
export const getIssuerDetail = (clusterName, namespace, name) =>
  axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/issuers/${name}`);
// 添加颁发者
export const postAddIssuer = (clusterName, namespace, name, body = {}) =>
  axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/issuers/${name}`, body);
// 更新颁发者
export const patchUpdateIssuer = (clusterName, namespace, name, body = {}) =>
  axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/issuers/${name}`, body);
// 删除颁发者
export const deleteIssuer = (clusterName, namespace, name) =>
  axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/issuers/${name}`);
