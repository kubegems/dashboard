import axios from 'axios';

import { getApiVersion } from '@/utils/helpers';

// 定时任务列表
export const getCronJobList = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('cronjob', 'batch/v1beta1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/cronjobs`, {
    params: query,
  });
};
// 定时任务详情
export const getCronJobDetail = (
  clusterName: string,
  namespace: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('cronjob', 'batch/v1beta1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/cronjobs/${name}`, {
    params: query,
  });
};
// 添加定时任务
export const postAddCronJob = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('cronjob', 'batch/v1beta1');
  return axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/cronjobs/${name}`, body);
};
// 更新定时任务
export const patchUpdateCronJob = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('cronjob', 'batch/v1beta1');
  return axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/cronjobs/${name}`, body);
};
// 删除定时任务
export const deleteCronJob = (
  clusterName: string,
  namespace: string,
  name: string,
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('cronjob', 'batch/v1beta1');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/cronjobs/${name}`);
};
