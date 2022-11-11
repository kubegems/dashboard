import axios from 'axios';

import { getApiVersion } from '@/utils/helpers';

// 网关实例列表
export const getIstioGatewayInstanceList = (virtualspaceid, clusterid, query = {}) =>
  axios(`virtualspace/${virtualspaceid}/cluster/${clusterid}/istiogateways`, {
    params: query,
  });
// 网关实例详情
export const getIstioGatewayInstanceDetail = (virtualspaceid, clusterid, name, query = {}) =>
  axios(`virtualspace/${virtualspaceid}/cluster/${clusterid}/istiogateways/${name}`, {
    params: query,
  });
// 添加网关实例
export const postAddIstioGatewayInstance = (virtualspaceid, clusterid, body = {}) =>
  axios.post(`virtualspace/${virtualspaceid}/cluster/${clusterid}/istiogateways`, body);
// 更新网关实例
export const putUpdateIstioGatewayInstance = (virtualspaceid, clusterid, body = {}) =>
  axios.put(`virtualspace/${virtualspaceid}/cluster/${clusterid}/istiogateways`, body);
// 删除网关实例
export const deleteIstioGatewayInstance = (virtualspaceid, clusterid, name) =>
  axios.delete(`virtualspace/${virtualspaceid}/cluster/${clusterid}/istiogateways/${name}`);
// 网关列表
export const getIstioGatewayList = (clusterName, namespace, query = {}) => {
  const apiVersion = getApiVersion('gateway', 'networking.istio.io/v1beta1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/gateway`, {
    params: query,
  });
};
// 网关详情
export const getIstioGatewayDetail = (clusterName, namespace, name) => {
  const apiVersion = getApiVersion('gateway', 'networking.istio.io/v1beta1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/gateway/${name}`);
};
// 添加网关
export const postAddIstioGateway = (clusterName, namespace, name, body = {}) => {
  const apiVersion = getApiVersion('gateway', 'networking.istio.io/v1beta1');
  return axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/gateway/${name}`, body);
};
// 更新网关
export const patchUpdateIstioGateway = (clusterName, namespace, name, body = {}) => {
  const apiVersion = getApiVersion('gateway', 'networking.istio.io/v1beta1');
  return axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/gateway/${name}`, body);
};
// 删除网关
export const deleteIstioGateway = (clusterName, namespace, name) => {
  const apiVersion = getApiVersion('gateway', 'networking.istio.io/v1beta1');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/gateway/${name}`);
};
