import axios from 'axios';

// 监控接收器列表
export const getReceiverList = (clusterName, namespace, query = {}) =>
  axios(`observability/cluster/${clusterName}/namespaces/${namespace}/receivers`, {
    params: query,
  });
// 添加监控接收器
export const postAddReceiver = (clusterName, namespace, body = {}) =>
  axios.post(`observability/cluster/${clusterName}/namespaces/${namespace}/receivers`, body);
// 删除监控接收器
export const deleteReceiver = (clusterName, namespace, name, query = {}) =>
  axios.delete(`observability/cluster/${clusterName}/namespaces/${namespace}/receivers/${name}`, {
    params: query,
  });
// 更新监控接收器
export const putUpdateReceiver = (clusterName, namespace, name, body = {}) =>
  axios.put(`observability/cluster/${clusterName}/namespaces/${namespace}/receivers/${name}`, body);
// 发送测试邮件
export const postSendTestEmail = (clusterName, namespace, name, body = {}) =>
  axios.post(`observability/cluster/${clusterName}/namespaces/${namespace}/receivers/${name}/actions/test`, body);
