import axios from 'axios';

import { getApiVersion } from '@/utils/helpers';

// ds列表
export const getDaemonSetList = (clusterName, namespace, query = {}) => {
  const apiVersion = getApiVersion('daemonset', 'apps/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/daemonsets`, {
    params: query,
  });
};
// ds详情
export const getDaemonSetDetail = (clusterName, namespace, name, query = {}) => {
  const apiVersion = getApiVersion('daemonset', 'apps/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/daemonsets/${name}`, {
    params: query,
  });
};
// 添加ds
export const postAddDaemonSet = (clusterName, namespace, name, body = {}) => {
  const apiVersion = getApiVersion('daemonset', 'apps/v1');
  return axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/daemonsets/${name}`, body);
};
// 更新ds
export const patchUpdateDaemonSet = (clusterName, namespace, name, body = {}) => {
  const apiVersion = getApiVersion('daemonset', 'apps/v1');
  return axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/daemonsets/${name}`, body);
};
// 删除ds
export const deleteDaemonSet = (clusterName, namespace, name) => {
  const apiVersion = getApiVersion('daemonset', 'apps/v1');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/daemonsets/${name}`);
};
