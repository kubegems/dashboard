import axios from 'axios';

import { getApiVersion } from 'src/utils/helpers';

// sts列表
export const getStatefulSetList = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('statefulset', 'apps/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/statefulsets`, {
    params: query,
  });
};
// sts详情
export const getStatefulSetDetail = (
  clusterName: string,
  namespace: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('statefulset', 'apps/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/statefulsets/${name}`, {
    params: query,
  });
};
// 添加sts
export const postAddStatefulSet = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('statefulset', 'apps/v1');
  return axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/statefulsets/${name}`, body);
};
// 更新sts
export const patchUpdateStatefulSet = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('statefulset', 'apps/v1');
  return axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/statefulsets/${name}`, body);
};
// 删除sts
export const deleteStatefulSet = (
  clusterName: string,
  namespace: string,
  name: string,
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('statefulset', 'apps/v1');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/statefulsets/${name}`);
};
