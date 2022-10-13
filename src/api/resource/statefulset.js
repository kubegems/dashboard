import axios from 'axios';

import { getApiVersion } from '@/utils/helpers';

// sts列表
export const getStatefulSetList = (clusterName, namespace, query = {}) => {
  const apiVersion = getApiVersion('statefulset', 'apps/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/statefulsets`, {
    params: query,
  });
};
// sts详情
export const getStatefulSetDetail = (clusterName, namespace, name, query = {}) => {
  const apiVersion = getApiVersion('statefulset', 'apps/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/statefulsets/${name}`, {
    params: query,
  });
};
// 添加sts
export const postAddStatefulSet = (clusterName, namespace, name, body = {}) => {
  const apiVersion = getApiVersion('statefulset', 'apps/v1');
  return axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/statefulsets/${name}`, body);
};
// 更新sts
export const patchUpdateStatefulSet = (clusterName, namespace, name, body = {}) => {
  const apiVersion = getApiVersion('statefulset', 'apps/v1');
  return axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/statefulsets/${name}`, body);
};
// 删除sts
export const deleteStatefulSet = (clusterName, namespace, name) => {
  const apiVersion = getApiVersion('statefulset', 'apps/v1');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/statefulsets/${name}`);
};
