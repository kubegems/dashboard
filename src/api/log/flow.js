import axios from 'axios';

import { jsonParse } from '@/utils/helpers';

const apiResources = jsonParse(window.localStorage.getItem('api-resources')) || {};
let apiVersion = apiResources['flow'] || 'logging.banzaicloud.io/v1beta1';
apiVersion = apiVersion === 'v1' ? 'core/v1' : apiVersion;

// 添加clusterFlow
export const postClusterFlowData = (clusterName, namespace, name, body = {}) =>
  axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/clusterflow/${name}`, body);

// 删除clusterFlow
export const deleteClusterFlowData = (clusterName, namespace, name) =>
  axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/clusterflow/${name}`);

// 修改clusterFlow
export const patchClusterFlowData = (clusterName, namespace, name, body = {}) =>
  axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/clusterflow/${name}`, body);

// 获取clusterFlow列表
export const getClusterFlowsData = (clusterName, namespace, query = {}) =>
  axios.get(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/clusterflow`, {
    params: query,
  });

// 获取clusterFlow详情
export const getClusterFlowDetailData = (clusterName, namespace, name, query = {}) =>
  axios.get(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/clusterflow/${name}`, {
    params: query,
  });

// 新增flow
export const postFlowData = (clusterName, namespace, name, body = {}) =>
  axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/flow/${name}`, body);

// 删除flow
export const deleteFlowData = (clusterName, namespace, name) =>
  axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/flow/${name}`);

// 更新Flow
export const patchFlowData = (clusterName, namespace, name, body = {}) =>
  axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/flow/${name}`, body);

// 获取flow列表
export const getFlowsData = (clusterName, namespace, query = {}) =>
  axios.get(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/flow`, {
    params: query,
  });

// 获取租户flow列表
export const getFlowsDataByTenant = (clusterName, tenantName, query = {}) =>
  axios.get(`logging/cluster/${clusterName}/tenant/${tenantName}/flows`, { params: query });

// 获取flow详情
export const getFlowDetailData = (clusterName, namespace, name, query = {}) =>
  axios.get(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/flow/${name}`, {
    params: query,
  });
