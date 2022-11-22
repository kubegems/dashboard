import axios from 'axios';

import { TENANT_NETWORK_POLICY_GROUP } from '@/constants/gvk';
import { getApiVersion } from '@/utils/helpers';

// 网络隔离策略详情
export const getNetworkPolicyDetail = (
  clusterName: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('tenantnetworkpolicy', `${TENANT_NETWORK_POLICY_GROUP}/v1beta1`);
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/tenantnetworkpolicies/${name}`, {
    params: query,
  });
};
// 更新项目网络隔离策略
export const postUpdateProjectNetworkPolicy = (
  projectid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.post(`/project/${projectid}/action/networkisolate`, body);
// 更新环境网络隔离策略
export const postUpdateEnvironmentNetworkPolicy = (
  environmentid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.post(`environment/${environmentid}/action/networkisolate`, body);
