import axios from 'axios';

import { getApiVersion } from '@/utils/helpers';

const apiVersion = getApiVersion('daemonset', 'apps/v1');

// ds列表
export const getDaemonSetList = (clusterName, namespace, query = {}) =>
  axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/daemonsets`, {
    params: query,
  });
// ds详情
export const getDaemonSetDetail = (clusterName, namespace, name, query = {}) =>
  axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/daemonsets/${name}`, {
    params: query,
  });
// 添加ds
export const postAddDaemonSet = (clusterName, namespace, name, body = {}) =>
  axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/daemonsets/${name}`, body);
// 更新ds
export const patchUpdateDaemonSet = (clusterName, namespace, name, body = {}) =>
  axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/daemonsets/${name}`, body);
// 删除ds
export const deleteDaemonSet = (clusterName, namespace, name) =>
  axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/daemonsets/${name}`);
