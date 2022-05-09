import axios from 'axios'

// 日志接收器列表
export const getLogReceiverList = (clusterName, namespace, query = {}) =>
  axios(`observability/cluster/${clusterName}/namespaces/${namespace}/logging/receivers`, {
    params: query,
  })
// 添加日志接收器
export const postAddLogReceiver = (clusterName, namespace, body = {}) =>
  axios.post(
    `observability/cluster/${clusterName}/namespaces/${namespace}/logging/receivers`,
    body,
  )
// 删除日志接收器
export const deleteLogReceiver = (clusterName, namespace, name) =>
  axios.delete(
    `observability/cluster/${clusterName}/namespaces/${namespace}/logging/receivers/${name}`,
  )
// 更新日志接收器
export const putUpdateLogReceiver = (clusterName, namespace, name, body = {}) =>
  axios.put(
    `observability/cluster/${clusterName}/namespaces/${namespace}/logging/receivers/${name}`,
    body,
  )
