import { getApiVersion } from '@kubegems/libs/utils/helpers';
import axios from 'axios';

// 添加clusterFlow
export const postClusterFlowData = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('flow', 'logging.banzaicloud.io/v1beta1');
  return axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/clusterflow/${name}`, body);
};

// 删除clusterFlow
export const deleteClusterFlowData = (
  clusterName: string,
  namespace: string,
  name: string,
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('flow', 'logging.banzaicloud.io/v1beta1');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/clusterflow/${name}`);
};

// 修改clusterFlow
export const patchClusterFlowData = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('flow', 'logging.banzaicloud.io/v1beta1');
  return axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/clusterflow/${name}`, body);
};

// 获取clusterFlow列表
export const getClusterFlowsData = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('flow', 'logging.banzaicloud.io/v1beta1');
  return axios.get(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/clusterflow`, {
    params: query,
  });
};

// 获取clusterFlow详情
export const getClusterFlowDetailData = (
  clusterName: string,
  namespace: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('flow', 'logging.banzaicloud.io/v1beta1');
  return axios.get(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/clusterflow/${name}`, {
    params: query,
  });
};

// 新增flow
export const postFlowData = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('flow', 'logging.banzaicloud.io/v1beta1');
  return axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/flow/${name}`, body);
};

// 删除flow
export const deleteFlowData = (
  clusterName: string,
  namespace: string,
  name: string,
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('flow', 'logging.banzaicloud.io/v1beta1');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/flow/${name}`);
};

// 更新Flow
export const patchFlowData = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('flow', 'logging.banzaicloud.io/v1beta1');
  return axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/flow/${name}`, body);
};

// 获取flow列表
export const getFlowsData = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('flow', 'logging.banzaicloud.io/v1beta1');
  return axios.get(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/flow`, {
    params: query,
  });
};

// 获取租户flow列表
export const getFlowsDataByTenant = (
  clusterName: string,
  tenantName: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.get(`logging/cluster/${clusterName}/tenant/${tenantName}/flows`, { params: query });

// 获取flow详情
export const getFlowDetailData = (
  clusterName: string,
  namespace: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('flow', 'logging.banzaicloud.io/v1beta1');
  return axios.get(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/flow/${name}`, {
    params: query,
  });
};
