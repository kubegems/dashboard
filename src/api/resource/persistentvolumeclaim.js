import axios from 'axios'

// 存储卷列表
export const getPersistentVolumeClaimList = (clusterName, namespace, query = {}) =>
  axios(
    `proxy/cluster/${clusterName}/custom/core/v1/namespaces/${namespace}/pvcs`,
    {
      params: query,
    },
  )
// 存储卷详情
export const getPersistentVolumeClaimDetail = (
  clusterName,
  namespace,
  name,
  query = {},
) =>
  axios(
    `proxy/cluster/${clusterName}/custom/core/v1/namespaces/${namespace}/pvcs/${name}`,
    { params: query },
  )
// 添加存储卷
export const postAddPersistentVolumeClaim = (
  clusterName,
  namespace,
  name,
  body = {},
) =>
  axios.post(
    `proxy/cluster/${clusterName}/core/v1/namespaces/${namespace}/persistentvolumeclaims/${name}`,
    body,
  )
// 更新存储卷
export const patchUpdatePersistentVolumeClaim = (
  clusterName,
  namespace,
  name,
  body = {},
) =>
  axios.patch(
    `proxy/cluster/${clusterName}/core/v1/namespaces/${namespace}/persistentvolumeclaims/${name}`,
    body,
  )
// 删除存储卷
export const deletePersistentVolumeClaim = (clusterName, namespace, name) =>
  axios.delete(
    `proxy/cluster/${clusterName}/core/v1/namespaces/${namespace}/persistentvolumeclaims/${name}`,
  )
