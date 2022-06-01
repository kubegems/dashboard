import axios from 'axios'

// 路由列表
export const getIngressList = (clusterName, namespace, query = {}) =>
  axios(
    `proxy/cluster/${clusterName}/networking.k8s.io/v1beta1/namespaces/${namespace}/ingress`,
    {
      params: query,
    },
  )
// 路由详情
export const getIngressDetail = (clusterName, namespace, name, query = {}) =>
  axios(
    `proxy/cluster/${clusterName}/networking.k8s.io/v1beta1/namespaces/${namespace}/ingress/${name}`,
    { params: query },
  )
// 添加路由
export const postAddIngress = (clusterName, namespace, name, body = {}) =>
  axios.post(
    `proxy/cluster/${clusterName}/networking.k8s.io/v1beta1/namespaces/${namespace}/ingress/${name}`,
    body,
  )
// 更新路由
export const patchUpdateIngress = (clusterName, namespace, name, body = {}) =>
  axios.patch(
    `proxy/cluster/${clusterName}/networking.k8s.io/v1beta1/namespaces/${namespace}/ingress/${name}`,
    body,
  )
// 删除路由
export const deleteIngress = (clusterName, namespace, name) =>
  axios.delete(
    `proxy/cluster/${clusterName}/networking.k8s.io/v1beta1/namespaces/${namespace}/ingress/${name}`,
  )
