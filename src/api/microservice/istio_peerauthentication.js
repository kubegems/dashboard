import axios from 'axios';

import { jsonParse } from '@/utils/helpers';

const apiResources = jsonParse(window.localStorage.getItem('api-resources')) || {};
let apiVersion = apiResources['peerauthentication'] || 'security.istio.io/v1beta1';
apiVersion = apiVersion === 'v1' ? 'core/v1' : apiVersion;

// 端点认证列表
export const getIstioPeerAuthenticationList = (clusterName, namespace, query = {}) =>
  axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/peerauthentication`, {
    params: query,
  });
// 端点认证详情
export const getIstioPeerAuthenticationDetail = (clusterName, namespace, name) =>
  axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/peerauthentication/${name}`);
// 添加端点认证
export const postAddIstioPeerAuthentication = (clusterName, namespace, name, body = {}) =>
  axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/peerauthentication/${name}`, body);
// 更新端点认证
export const patchUpdateIstioPeerAuthentication = (clusterName, namespace, name, body = {}) =>
  axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/peerauthentication/${name}`, body);
// 删除端点认证
export const deleteIstioPeerAuthentication = (clusterName, namespace, name) =>
  axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/peerauthentication/${name}`);
