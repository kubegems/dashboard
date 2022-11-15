import axios from 'axios';

// 日志告警规则列表
export const getLogAlertRuleList = (
  clusterName,
  namespace,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`observability/cluster/${clusterName}/namespaces/${namespace}/logging/alerts`, {
    params: query,
  });
// 日志告警规则详情
export const getLogAlertRuleDetail = (
  clusterName: string,
  namespace: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`observability/cluster/${clusterName}/namespaces/${namespace}/logging/alerts/${name}`, {
    params: query,
  });
// 添加日志告警规则
export const postAddLogAlertRule = (
  clusterName: string,
  namespace: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.post(`observability/cluster/${clusterName}/namespaces/${namespace}/logging/alerts`, body);
// 删除日志告警规则
export const deleteLogAlertRule = (
  clusterName: string,
  namespace: string,
  name: string,
): Promise<{ [key: string]: any }> =>
  axios.delete(`observability/cluster/${clusterName}/namespaces/${namespace}/logging/alerts/${name}`);
// 更新日志告警规则
export const putUpdateLogAlertRule = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.put(`observability/cluster/${clusterName}/namespaces/${namespace}/logging/alerts/${name}`, body);
// 禁用日志告警规则
export const postDisableAlertRule = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.post(`observability/cluster/${clusterName}/namespaces/${namespace}/alerts/${name}/actions/disable`, body);
// 启用日志告警规则
export const postEnableAlertRule = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.post(`observability/cluster/${clusterName}/namespaces/${namespace}/alerts/${name}/actions/enable`, body);
