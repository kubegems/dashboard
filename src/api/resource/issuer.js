import axios from 'axios'

// 颁发者列表
export const getIssuerList = (clusterName, namespace, query = {}) =>
  axios(
    `proxy/cluster/${clusterName}/cert-manager.io/v1/namespaces/${namespace}/issuers`,
    {
      params: query,
    },
  )
// 颁发者详情
export const getIssuerDetail = (clusterName, namespace, name) =>
  axios(
    `proxy/cluster/${clusterName}/cert-manager.io/v1/namespaces/${namespace}/issuers/${name}`,
  )
// 添加颁发者
export const postAddIssuer = (clusterName, namespace, name, body = {}) =>
  axios.post(
    `proxy/cluster/${clusterName}/cert-manager.io/v1/namespaces/${namespace}/issuers/${name}`,
    body,
  )
// 更新颁发者
export const patchUpdateIssuer = (clusterName, namespace, name, body = {}) =>
  axios.patch(
    `proxy/cluster/${clusterName}/cert-manager.io/v1/namespaces/${namespace}/issuers/${name}`,
    body,
  )
// 删除颁发者
export const deleteIssuer = (clusterName, namespace, name) =>
  axios.delete(
    `proxy/cluster/${clusterName}/cert-manager.io/v1/namespaces/${namespace}/issuers/${name}`,
  )
