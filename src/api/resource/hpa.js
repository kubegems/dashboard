import axios from 'axios'

// hpa详情
export const getHpaDetail = (clusterName, namespace, query = {}) =>
  axios(`noproxy/${clusterName}/${namespace}/hpa`, {
    params: query,
  })
// 设置hpa
export const postSetHpa = (clusterName, namespace, body = {}) =>
  axios.post(`noproxy/${clusterName}/${namespace}/hpa`, body)
// 删除hpa
export const deleteHpa = (clusterName, namespace, name) =>
  axios.delete(
    `proxy/cluster/${clusterName}/autoscaling/v2beta2/namespaces/${namespace}/horizontalpodautoscaler/${name}`,
  )
