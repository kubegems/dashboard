import axios from 'axios';

import { getApiVersion } from '@/utils/helpers';

const apiVersion = getApiVersion('ingress', 'networking.k8s.io/v1');

// 路由列表
export const getIngressList = (clusterName, namespace, query = {}) =>
  axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/ingresses`, {
    params: query,
  });
// 路由详情
export const getIngressDetail = (clusterName, namespace, name, query = {}) =>
  axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/ingresses/${name}`, {
    params: query,
  });
// 添加路由
export const postAddIngress = (clusterName, namespace, name, body = {}) =>
  axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/ingresses/${name}`, body);
// 更新路由
export const patchUpdateIngress = (clusterName, namespace, name, body = {}) =>
  axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/ingresses/${name}`, body);
// 删除路由
export const deleteIngress = (clusterName, namespace, name) =>
  axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/ingresses/${name}`);
