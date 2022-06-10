import axios from 'axios';

// 日志告警规则列表
export const getLogAlertRuleList = (clusterName, namespace, query = {}) =>
  axios(`observability/cluster/${clusterName}/namespaces/${namespace}/logging/alerts`, {
    params: query,
  });
// 日志告警规则详情
export const getLogAlertRuleDetail = (clusterName, namespace, name, query = {}) =>
  axios(`observability/cluster/${clusterName}/namespaces/${namespace}/logging/alerts/${name}`, {
    params: query,
  });
// 添加日志告警规则
export const postAddLogAlertRule = (clusterName, namespace, body = {}) =>
  axios.post(`observability/cluster/${clusterName}/namespaces/${namespace}/logging/alerts`, body);
// 删除日志告警规则
export const deleteLogAlertRule = (clusterName, namespace, name) =>
  axios.delete(`observability/cluster/${clusterName}/namespaces/${namespace}/logging/alerts/${name}`);
// 更新日志告警规则
export const putUpdateLogAlertRule = (clusterName, namespace, name, body = {}) =>
  axios.put(`observability/cluster/${clusterName}/namespaces/${namespace}/logging/alerts/${name}`, body);
// 禁用日志告警规则
export const postDisableAlertRule = (clusterName, namespace, name, body = {}) =>
  axios.post(`observability/cluster/${clusterName}/namespaces/${namespace}/alerts/${name}/actions/disable`, body);
// 启用日志告警规则
export const postEnableAlertRule = (clusterName, namespace, name, body = {}) =>
  axios.post(`observability/cluster/${clusterName}/namespaces/${namespace}/alerts/${name}/actions/enable`, body);
