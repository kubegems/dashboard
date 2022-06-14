import axios from 'axios';

import { jsonParse } from '@/utils/helpers';

const apiResources = jsonParse(window.localStorage.getItem('api-resources')) || {};
let apiVersion = apiResources['sidecar'] || 'networking.istio.io/v1beta1';
apiVersion = apiVersion === 'v1' ? 'core/v1' : apiVersion;

// 边车列表
export const getIstioSidecarList = (clusterName, namespace, query = {}) =>
  axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/sidecar`, {
    params: query,
  });
// 边车详情
export const getIstioSidecarDetail = (clusterName, namespace, name) =>
  axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/sidecar/${name}`);
// 添加边车
export const postAddIstioSidecar = (clusterName, namespace, name, body = {}) =>
  axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/sidecar/${name}`, body);
// 更新边车
export const patchUpdateIstioSidecar = (clusterName, namespace, name, body = {}) =>
  axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/sidecar/${name}`, body);
// 删除边车
export const deleteIstioSidecar = (clusterName, namespace, name) =>
  axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/sidecar/${name}`);
