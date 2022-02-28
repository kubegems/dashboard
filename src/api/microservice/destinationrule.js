import axios from 'axios'

// 流量规则详情
export const getIstioDestinationRuleDetail = (clusterName, namespace, name) =>
  axios(
    `proxy/cluster/${clusterName}/networking.istio.io/v1beta1/namespaces/${namespace}/destinationrule/${name}`,
  )
// 添加流量规则
export const postAddIstioDestinationRule = (
  clusterName,
  namespace,
  name,
  body = {},
) =>
  axios.post(
    `proxy/cluster/${clusterName}/networking.istio.io/v1beta1/namespaces/${namespace}/destinationrule/${name}`,
    body,
  )
// 更新流量规则
export const patchUpdateIstioDestinationRule = (
  clusterName,
  namespace,
  name,
  body = {},
) =>
  axios.patch(
    `proxy/cluster/${clusterName}/networking.istio.io/v1beta1/namespaces/${namespace}/destinationrule/${name}`,
    body,
  )
// 删除流量规则
export const deleteIstioDestinationRule = (clusterName, namespace, name) =>
  axios.delete(
    `proxy/cluster/${clusterName}/networking.istio.io/v1beta1/namespaces/${namespace}/destinationrule/${name}`,
  )
