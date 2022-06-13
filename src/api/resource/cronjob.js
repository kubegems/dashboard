import axios from 'axios';

import { jsonParse } from '@/utils/helpers';

const apiResources = jsonParse(window.localStorage.getItem('api-resources')) || {};
let apiVersion = apiResources['cronjob'] || 'batch/v1beta1';
apiVersion = apiVersion === 'v1' ? 'core/v1' : apiVersion;

// 定时任务列表
export const getCronJobList = (clusterName, namespace, query = {}) =>
  axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/cronjobs`, {
    params: query,
  });
// 定时任务详情
export const getCronJobDetail = (clusterName, namespace, name, query = {}) =>
  axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/cronjobs/${name}`, {
    params: query,
  });
// 添加定时任务
export const postAddCronJob = (clusterName, namespace, name, body = {}) =>
  axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/cronjobs/${name}`, body);
// 更新定时任务
export const patchUpdateCronJob = (clusterName, namespace, name, body = {}) =>
  axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/cronjobs/${name}`, body);
// 删除定时任务
export const deleteCronJob = (clusterName, namespace, name) =>
  axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/cronjobs/${name}`);
