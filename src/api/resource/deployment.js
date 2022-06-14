import axios from 'axios';

import { jsonParse } from '@/utils/helpers';

const apiResources = jsonParse(window.localStorage.getItem('api-resources')) || {};
let apiVersion = apiResources['deployment'] || 'apps/v1';
apiVersion = apiVersion === 'v1' ? 'core/v1' : apiVersion;

// deploy列表
export const getDeploymentList = (clusterName, namespace, query = {}) =>
  axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/deployments`, {
    params: query,
  });
// deploy详情
export const getDeploymentDetail = (clusterName, namespace, name, query = {}) =>
  axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/deployments/${name}`, {
    params: query,
  });
// 添加deploy
export const postAddDeployment = (clusterName, namespace, name, body = {}) =>
  axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/deployments/${name}`, body);
// 更新deploy
export const patchUpdateDeployment = (clusterName, namespace, name, body = {}) =>
  axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/deployments/${name}`, body);

// 删除deploy
export const deleteDeployment = (clusterName, namespace, name) =>
  axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/deployments/${name}`);
