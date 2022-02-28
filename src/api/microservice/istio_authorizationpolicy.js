import axios from 'axios'

// 认证策略列表
export const getIstioAuthorizationPolicyList = (
  clusterName,
  namespace,
  query = {},
) =>
  axios(
    `proxy/cluster/${clusterName}/security.istio.io/v1beta1/namespaces/${namespace}/authorizationpolicy`,
    { params: query },
  )
// 认证策略详情
export const getIstioAuthorizationPolicyDetail = (clusterName, namespace, name) =>
  axios(
    `proxy/cluster/${clusterName}/security.istio.io/v1beta1/namespaces/${namespace}/authorizationpolicy/${name}`,
  )
// 添加认证策略
export const postAddIstioAuthorizationPolicy = (
  clusterName,
  namespace,
  name,
  body = {},
) =>
  axios.post(
    `proxy/cluster/${clusterName}/security.istio.io/v1beta1/namespaces/${namespace}/authorizationpolicy/${name}`,
    body,
  )
// 更新认证策略
export const patchUpdateIstioAuthorizationPolicy = (
  clusterName,
  namespace,
  name,
  body = {},
) =>
  axios.patch(
    `proxy/cluster/${clusterName}/security.istio.io/v1beta1/namespaces/${namespace}/authorizationpolicy/${name}`,
    body,
  )
// 删除认证策略
export const deleteIstioAuthorizationPolicy = (clusterName, namespace, name) =>
  axios.delete(
    `proxy/cluster/${clusterName}/security.istio.io/v1beta1/namespaces/${namespace}/authorizationpolicy/${name}`,
  )
