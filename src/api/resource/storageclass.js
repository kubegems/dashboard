import axios from 'axios'

// 存储类型列表
export const getStorageClassList = (clusterName, query = {}) =>
  axios(`proxy/cluster/${clusterName}/storage.k8s.io/v1/storageclasses`, {
    params: query,
  })
// 存储类型详情
export const getStorageClassDetail = (clusterName, name) =>
  axios(`proxy/cluster/${clusterName}/storage.k8s.io/v1/storageclasses/${name}`)
// 添加存储类型
export const postAddStorageClass = (clusterName, name, body = {}) =>
  axios.post(
    `proxy/cluster/${clusterName}/storage.k8s.io/v1/storageclasses/${name}`,
    body,
  )
// 更新存储类型
export const patchUpdateStorageClass = (clusterName, name, body = {}) =>
  axios.patch(
    `proxy/cluster/${clusterName}/storage.k8s.io/v1/storageclasses/${name}`,
    body,
  )
// 删除存储类型
export const deleteStorageClass = (clusterName, name) =>
  axios.delete(
    `proxy/cluster/${clusterName}/storage.k8s.io/v1/storageclasses/${name}`,
  )
