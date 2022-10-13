import axios from 'axios';

import { getApiVersion } from '@/utils/helpers';

// 定时任务列表
export const getCronJobList = (clusterName, namespace, query = {}) => {
  const apiVersion = getApiVersion('cronjob', 'batch/v1beta1');
  axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/cronjobs`, {
    params: query,
  });
};
// 定时任务详情
export const getCronJobDetail = (clusterName, namespace, name, query = {}) => {
  const apiVersion = getApiVersion('cronjob', 'batch/v1beta1');
  axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/cronjobs/${name}`, {
    params: query,
  });
};
// 添加定时任务
export const postAddCronJob = (clusterName, namespace, name, body = {}) => {
  const apiVersion = getApiVersion('cronjob', 'batch/v1beta1');
  axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/cronjobs/${name}`, body);
};
// 更新定时任务
export const patchUpdateCronJob = (clusterName, namespace, name, body = {}) => {
  const apiVersion = getApiVersion('cronjob', 'batch/v1beta1');
  axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/cronjobs/${name}`, body);
};
// 删除定时任务
export const deleteCronJob = (clusterName, namespace, name) => {
  const apiVersion = getApiVersion('cronjob', 'batch/v1beta1');
  axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/cronjobs/${name}`);
};
