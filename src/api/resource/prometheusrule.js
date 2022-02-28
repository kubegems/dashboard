import axios from 'axios'

// 告警规则列表
export const getPrometheusRuleList = (clusterName, namespace, query = {}) =>
  axios(`alerts/cluster/${clusterName}/namespaces/${namespace}/alert`, {
    params: query,
  })
// 添加告警规则
export const postAddPrometheusRule = (clusterName, namespace, body = {}) =>
  axios.post(
    `alerts/cluster/${clusterName}/namespaces/${namespace}/alert`,
    body,
  )
// 禁用告警规则
export const postDisablePrometheusRule = (clusterName, namespace, name) =>
  axios.post(
    `alerts/cluster/${clusterName}/namespaces/${namespace}/alert/${name}/actions/disable`,
  )
// 启用告警规则
export const postEnablePrometheusRule = (clusterName, namespace, name) =>
  axios.post(
    `alerts/cluster/${clusterName}/namespaces/${namespace}/alert/${name}/actions/enable`,
  )
// 删除告警规则
export const deletePrometheusRule = (clusterName, namespace, name) =>
  axios.delete(
    `alerts/cluster/${clusterName}/namespaces/${namespace}/alert/${name}`,
  )
// 更新告警规则
export const putUpdatePrometheusRule = (clusterName, namespace, name, body = {}) =>
  axios.put(
    `alerts/cluster/${clusterName}/namespaces/${namespace}/alert/${name}`,
    body,
  )
// 告警规则详情
export const getPrometheusRuleDetail = (
  clusterName,
  namespace,
  name,
  query = {},
) =>
  axios(`alerts/cluster/${clusterName}/namespaces/${namespace}/alert/${name}`, {
    params: query,
  })
// 告警规则历史
export const getPrometheusAlertHistory = (
  clusterName,
  namespace,
  name,
  query = {},
) =>
  axios(
    `alerts/cluster/${clusterName}/namespaces/${namespace}/alert/${name}/history`,
    {
      params: Object.assign(query, {}),
    },
  )
// 搜索告警
export const getPrometheusAletrsSearch = (query = {}) => axios.get('alerts/search', { params: query })
// 告警黑名单列表
export const getPrometheusBlackList = (query = {}) => axios.get('alerts/blacklist', { params: query })
// 加入/更新告警黑名单
export const postAddPrometheusBlacklist = (body = {}) => axios.post('alerts/blacklist', body)
// 移除告警黑名单
export const deletePrometheusBlacklist = fingerprint => axios.delete(`alerts/blacklist/${fingerprint}`)
