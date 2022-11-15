import axios from 'axios';

import { getApiVersion } from 'src/utils/helpers';

// ds列表
export const getDaemonSetList = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('daemonset', 'apps/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/daemonsets`, {
    params: query,
  });
};
// ds详情
export const getDaemonSetDetail = (
  clusterName: string,
  namespace: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('daemonset', 'apps/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/daemonsets/${name}`, {
    params: query,
  });
};
// 添加ds
export const postAddDaemonSet = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('daemonset', 'apps/v1');
  return axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/daemonsets/${name}`, body);
};
// 更新ds
export const patchUpdateDaemonSet = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('daemonset', 'apps/v1');
  return axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/daemonsets/${name}`, body);
};
// 删除ds
export const deleteDaemonSet = (
  clusterName: string,
  namespace: string,
  name: string,
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('daemonset', 'apps/v1');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/daemonsets/${name}`);
};
