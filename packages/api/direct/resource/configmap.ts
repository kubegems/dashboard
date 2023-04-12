import { getApiVersion } from '@kubegems/libs/utils/helpers';
import axios from 'axios';

// 配置列表
export const getConfigMapList = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('configmap');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/configmaps`, {
    params: query,
  });
};
// 配置详情
export const getConfigMapDetail = (
  clusterName: string,
  namespace: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('configmap');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/configmaps/${name}`, {
    params: query,
  });
};
// 添加配置
export const postAddConfigMap = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('configmap');
  return axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/configmaps/${name}`, body);
};
// 更新配置
export const patchUpdateConfigMap = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('configmap');
  return axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/configmaps/${name}`, body);
};
// 删除配置
export const deleteConfigMap = (
  clusterName: string,
  namespace: string,
  name: string,
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('configmap');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/configmaps/${name}`);
};
