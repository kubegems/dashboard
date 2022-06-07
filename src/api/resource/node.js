import axios from 'axios'

const apiResources = window.localStorage.getItem('api-resources') || {}
const apiVersion = apiResources['node'] || 'core/v1'

// 节点列表
export const getNodeList = (clusterName, query = {}) =>
  axios(`proxy/cluster/${clusterName}/${apiVersion}/nodes`, {
    params: query,
  })
// 节点详情
export const getNodeDetail = (clusterName, name, query = {}) =>
  axios(`proxy/cluster/${clusterName}/${apiVersion}/nodes/${name}`, {
    params: query,
  })
// 节点资源分配
export const getNodeResourceAllocated = (clusterName, name, query = {}) =>
  axios(`proxy/cluster/${clusterName}/custom/core/v1/nodes/${name}`, {
    params: query,
  })
// 节点调度
export const patchCordonNode = (clusterName, name, body = {}) =>
  axios.patch(
    `proxy/cluster/${clusterName}/custom/core/v1/nodes/${name}/actions/cordon`,
    body,
  )
// 节点污点
export const patchTaintNode = (clusterName, name, body = {}) =>
  axios.patch(
    `proxy/cluster/${clusterName}/custom/core/v1/nodes/${name}/actions/taint`,
    body,
  )
// 节点metadata
export const patchMetadataNode = (clusterName, name, body = {}) =>
  axios.patch(
    `proxy/cluster/${clusterName}/custom/core/v1/nodes/${name}/actions/metadata`,
    body,
  )
