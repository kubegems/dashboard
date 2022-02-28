import axios from 'axios'

// 服务列表
export const getServiceList = (clusterName, namespace, query = {}) =>
  axios(
    `proxy/cluster/${clusterName}/core/v1/namespaces/${namespace}/services`,
    {
      params: query,
    },
  )
// 服务详情
export const getServiceDetail = (clusterName, namespace, name, query = {}) =>
  axios(
    `proxy/cluster/${clusterName}/core/v1/namespaces/${namespace}/services/${name}`,
    { params: query },
  )
// 添加服务
export const postAddService = (clusterName, namespace, name, body = {}) =>
  axios.post(
    `proxy/cluster/${clusterName}/core/v1/namespaces/${namespace}/services/${name}`,
    body,
  )
// 更新服务
export const patchUpdateService = (clusterName, namespace, name, body = {}) =>
  axios.patch(
    `proxy/cluster/${clusterName}/core/v1/namespaces/${namespace}/services/${name}`,
    body,
  )
// 删除服务
export const deleteService = (clusterName, namespace, name) =>
  axios.delete(
    `proxy/cluster/${clusterName}/core/v1/namespaces/${namespace}/services/${name}`,
  )
