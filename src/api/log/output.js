import axios from 'axios';

import { getApiVersion } from '@/utils/helpers';

const apiVersion = getApiVersion('output', 'logging.banzaicloud.io/v1beta1');

// 添加clusterOutput
export const postClusterOutputData = (clusterName, namespace, name, body = {}) =>
  axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/clusteroutput/${name}`, body);

// 删除clusterOutput
export const deleteClusterOutputData = (clusterName, namespace, name) =>
  axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/clusteroutput/${name}`);

// 修改clusterOutput
export const patchClusterOutputData = (clusterName, namespace, name, body = {}) =>
  axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/clusteroutput/${name}`, body);

// 获取clusterOutput列表
export const getClusterOutputsData = (clusterName, namespace, query = {}) =>
  axios.get(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/clusteroutput`, {
    params: query,
  });

// 获取clusterOutput详情
export const getClusterOutputDetailData = (clusterName, namespace, name, query = {}) =>
  axios.get(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/clusteroutput/${name}`, {
    params: query,
  });

// 新增output
export const postOutputData = (clusterName, namespace, name, body = {}) =>
  axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/output/${name}`, body);

// 删除output
export const deleteOutputData = (clusterName, namespace, name) =>
  axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/output/${name}`);

// 更新Flow
export const patchOutputData = (clusterName, namespace, name, body = {}) =>
  axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/output/${name}`, body);

// 获取output列表
export const getOutputsData = (clusterName, namespace, query = {}) =>
  axios.get(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/output`, {
    params: query,
  });

// 获取租户output列表
export const getOutputsDataByTenant = (clusterName, tenantName, query = {}) =>
  axios.get(`logging/cluster/${clusterName}/tenant/${tenantName}/outputs`, { params: query });

// 获取output详情
export const getOutputDetailData = (clusterName, namespace, name, query = {}) =>
  axios.get(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/output/${name}`, {
    params: query,
  });
