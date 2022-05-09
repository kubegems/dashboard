import axios from 'axios'

// 监控接收器列表
export const getReceiverList = (clusterName, namespace, query = {}) =>
  axios(`alerts/cluster/${clusterName}/namespaces/${namespace}/receiver`, {
    params: query,
  })
// 添加监控接收器
export const postAddReceiver = (clusterName, namespace, body = {}) =>
  axios.post(
    `alerts/cluster/${clusterName}/namespaces/${namespace}/receiver`,
    body,
  )
// 删除监控接收器
export const deleteReceiver = (clusterName, namespace, name) =>
  axios.delete(
    `alerts/cluster/${clusterName}/namespaces/${namespace}/receiver/${name}`,
  )
// 更新监控接收器
export const putUpdateReceiver = (clusterName, namespace, name, body = {}) =>
  axios.put(
    `alerts/cluster/${clusterName}/namespaces/${namespace}/receiver/${name}`,
    body,
  )
// 发送测试邮件
export const postSendTestEmail = (clusterName, namespace, name, body = {}) =>
  axios.post(
    `alerts/cluster/${clusterName}/namespaces/${namespace}/receiver/${name}/actions/test`,
    body,
  )
