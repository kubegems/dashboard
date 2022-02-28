import axios from 'axios'

// 边车列表
export const getIstioSidecarList = (clusterName, namespace, query = {}) =>
  axios(
    `proxy/cluster/${clusterName}/networking.istio.io/v1beta1/namespaces/${namespace}/sidecar`,
    { params: query },
  )
// 边车详情
export const getIstioSidecarDetail = (clusterName, namespace, name) =>
  axios(
    `proxy/cluster/${clusterName}/networking.istio.io/v1beta1/namespaces/${namespace}/sidecar/${name}`,
  )
// 添加边车
export const postAddIstioSidecar = (clusterName, namespace, name, body = {}) =>
  axios.post(
    `proxy/cluster/${clusterName}/networking.istio.io/v1beta1/namespaces/${namespace}/sidecar/${name}`,
    body,
  )
// 更新边车
export const patchUpdateIstioSidecar = (clusterName, namespace, name, body = {}) =>
  axios.patch(
    `proxy/cluster/${clusterName}/networking.istio.io/v1beta1/namespaces/${namespace}/sidecar/${name}`,
    body,
  )
// 删除边车
export const deleteIstioSidecar = (clusterName, namespace, name) =>
  axios.delete(
    `proxy/cluster/${clusterName}/networking.istio.io/v1beta1/namespaces/${namespace}/sidecar/${name}`,
  )
