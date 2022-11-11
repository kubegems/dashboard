import axios from 'axios';

import { TENANT_NETWORK_POLICY_GROUP } from '@/utils/gvk';
import { getApiVersion } from '@/utils/helpers';

// 网络隔离策略详情
export const getNetworkPolicyDetail = (clusterName, name, query = {}) => {
  const apiVersion = getApiVersion('tenantnetworkpolicy', `${TENANT_NETWORK_POLICY_GROUP}/v1beta1`);
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/tenantnetworkpolicies/${name}`, {
    params: query,
  });
};
// 更新项目网络隔离策略
export const postUpdateProjectNetworkPolicy = (projectid, body = {}) =>
  axios.post(`/project/${projectid}/action/networkisolate`, body);
// 更新环境网络隔离策略
export const postUpdateEnvironmentNetworkPolicy = (environmentid, body = {}) =>
  axios.post(`environment/${environmentid}/action/networkisolate`, body);
