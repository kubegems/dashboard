import axios from 'axios';

import { getApiVersion } from 'src/utils/helpers';

// 路由列表
export const getIngressList = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('ingress', 'networking.k8s.io/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/ingresses`, {
    params: query,
  });
};
// 路由详情
export const getIngressDetail = (
  clusterName: string,
  namespace: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('ingress', 'networking.k8s.io/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/ingresses/${name}`, {
    params: query,
  });
};
// 添加路由
export const postAddIngress = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('ingress', 'networking.k8s.io/v1');
  return axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/ingresses/${name}`, body);
};
// 更新路由
export const patchUpdateIngress = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('ingress', 'networking.k8s.io/v1');
  return axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/ingresses/${name}`, body);
};
// 删除路由
export const deleteIngress = (
  clusterName: string,
  namespace: string,
  name: string,
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('ingress', 'networking.k8s.io/v1');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/ingresses/${name}`);
};
