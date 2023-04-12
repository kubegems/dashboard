import { getApiVersion } from '@kubegems/libs/utils/helpers';
import axios from 'axios';

// 任务列表
export const getJobList = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('job', 'batch/v1');
  return axios(`proxy/cluster/${clusterName}/custom/${apiVersion}/namespaces/${namespace}/jobs`, {
    params: query,
  });
};
// 任务详情
export const getJobDetail = (
  clusterName: string,
  namespace: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('job', 'batch/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/jobs/${name}`, {
    params: query,
  });
};
// 添加任务
export const postAddJob = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('job', 'batch/v1');
  return axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/jobs/${name}`, body);
};
// 更新任务
export const patchUpdateJob = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('job', 'batch/v1');
  return axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/jobs/${name}`, body);
};
// 删除任务
export const deleteJob = (clusterName: string, namespace: string, name: string): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('job', 'batch/v1');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/jobs/${name}`);
};
