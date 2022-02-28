import axios from 'axios'
import { NETWORK_GROUP } from '@/utils/gvk'

// 网络隔离策略详情
export const getNetworkPolicyDetail = (clusterName, name, query = {}) =>
  axios(
    `proxy/cluster/${clusterName}/${NETWORK_GROUP}/v1beta1/tenantnetworkpolicies/${name}`,
    { params: query },
  )
// 更新项目网络隔离策略
export const postUpdateProjectNetworkPolicy = (projectid, body = {}) =>
  axios.post(`/project/${projectid}/action/networkisolate`, body)
// 更新环境网络隔离策略
export const postUpdateEnvironmentNetworkPolicy = (environmentid, body = {}) =>
  axios.post(`environment/${environmentid}/action/networkisolate`, body)
