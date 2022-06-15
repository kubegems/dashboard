import axios from 'axios';

import { getApiVersion } from '@/utils/helpers';

const apiVersion = getApiVersion('serviceentry', 'networking.istio.io/v1beta1');

// 服务入口列表
export const getIstioServiceEntryList = (clusterName, namespace, query = {}) =>
  axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/serviceentry`, {
    params: query,
  });
// 服务入口详情
export const getIstioServiceEntryDetail = (clusterName, namespace, name) =>
  axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/serviceentry/${name}`);
// 添加服务入口
export const postAddIstioServiceEntry = (clusterName, namespace, name, body = {}) =>
  axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/serviceentry/${name}`, body);
// 更新服务入口
export const patchUpdateIstioServiceEntry = (clusterName, namespace, name, body = {}) =>
  axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/serviceentry/${name}`, body);
// 删除服务入口
export const deleteIstioServiceEntry = (clusterName, namespace, name) =>
  axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/serviceentry/${name}`);
