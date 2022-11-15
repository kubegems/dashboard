import axios from 'axios';

import { getApiVersion } from 'src/utils/helpers';

// 网关实例列表
export const getIstioGatewayInstanceList = (
  virtualspaceid: number,
  clusterid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`virtualspace/${virtualspaceid}/cluster/${clusterid}/istiogateways`, {
    params: query,
  });
// 网关实例详情
export const getIstioGatewayInstanceDetail = (
  virtualspaceid: number,
  clusterid: number,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`virtualspace/${virtualspaceid}/cluster/${clusterid}/istiogateways/${name}`, {
    params: query,
  });
// 添加网关实例
export const postAddIstioGatewayInstance = (
  virtualspaceid: number,
  clusterid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.post(`virtualspace/${virtualspaceid}/cluster/${clusterid}/istiogateways`, body);
// 更新网关实例
export const putUpdateIstioGatewayInstance = (
  virtualspaceid: number,
  clusterid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.put(`virtualspace/${virtualspaceid}/cluster/${clusterid}/istiogateways`, body);
// 删除网关实例
export const deleteIstioGatewayInstance = (
  virtualspaceid: number,
  clusterid: number,
  name: string,
): Promise<{ [key: string]: any }> =>
  axios.delete(`virtualspace/${virtualspaceid}/cluster/${clusterid}/istiogateways/${name}`);
// 网关列表
export const getIstioGatewayList = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('gateway', 'networking.istio.io/v1beta1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/gateway`, {
    params: query,
  });
};
// 网关详情
export const getIstioGatewayDetail = (
  clusterName: string,
  namespace: string,
  name: string,
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('gateway', 'networking.istio.io/v1beta1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/gateway/${name}`);
};
// 添加网关
export const postAddIstioGateway = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('gateway', 'networking.istio.io/v1beta1');
  return axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/gateway/${name}`, body);
};
// 更新网关
export const patchUpdateIstioGateway = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('gateway', 'networking.istio.io/v1beta1');
  return axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/gateway/${name}`, body);
};
// 删除网关
export const deleteIstioGateway = (
  clusterName: string,
  namespace: string,
  name: string,
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('gateway', 'networking.istio.io/v1beta1');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/gateway/${name}`);
};
