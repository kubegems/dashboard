import axios from 'axios';

import { getApiVersion } from '@/utils/helpers';

// 任务列表
export const getJobList = (clusterName, namespace, query = {}) => {
  const apiVersion = getApiVersion('job', 'batch/v1');
  return axios(`proxy/cluster/${clusterName}/custom/${apiVersion}/namespaces/${namespace}/jobs`, {
    params: query,
  });
};
// 任务详情
export const getJobDetail = (clusterName, namespace, name, query = {}) => {
  const apiVersion = getApiVersion('job', 'batch/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/jobs/${name}`, {
    params: query,
  });
};
// 添加任务
export const postAddJob = (clusterName, namespace, name, body = {}) => {
  const apiVersion = getApiVersion('job', 'batch/v1');
  return axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/jobs/${name}`, body);
};
// 更新任务
export const patchUpdateJob = (clusterName, namespace, name, body) => {
  const apiVersion = getApiVersion('job', 'batch/v1');
  return axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/jobs/${name}`, body);
};
// 删除任务
export const deleteJob = (clusterName, namespace, name) => {
  const apiVersion = getApiVersion('job', 'batch/v1');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/jobs/${name}`);
};
