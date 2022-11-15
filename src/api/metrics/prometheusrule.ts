import axios from 'axios';

// 告警规则列表
export const getPrometheusRuleList = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`observability/cluster/${clusterName}/namespaces/${namespace}/monitor/alerts`, {
    params: query,
  });
// 添加告警规则
export const postAddPrometheusRule = (
  clusterName: string,
  namespace: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.post(`observability/cluster/${clusterName}/namespaces/${namespace}/monitor/alerts`, body);
// 删除告警规则
export const deletePrometheusRule = (
  clusterName: string,
  namespace: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.delete(`observability/cluster/${clusterName}/namespaces/${namespace}/monitor/alerts/${name}`, {
    params: query,
  });
// 更新告警规则
export const putUpdatePrometheusRule = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.put(`observability/cluster/${clusterName}/namespaces/${namespace}/monitor/alerts/${name}`, body);
// 告警规则详情
export const getPrometheusRuleDetail = (
  clusterName: string,
  namespace: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`observability/cluster/${clusterName}/namespaces/${namespace}/monitor/alerts/${name}`, {
    params: query,
  });
// 告警规则历史
export const getPrometheusAlertHistory = (
  clusterName: string,
  namespace: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`observability/cluster/${clusterName}/namespaces/${namespace}/alerts/${name}/history`, {
    params: Object.assign(query, {}),
  });
// 搜索告警
export const getPrometheusAlertSearch = (
  tenantId: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.get(`observability/tenant/${tenantId}/alerts/search`, { params: query });
// 告警黑名单列表
export const getPrometheusBlackList = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.get('alerts/blacklist', { params: query });
// 加入/更新告警黑名单
export const postAddPrometheusBlacklist = (body: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.post('alerts/blacklist', body);
// 移除告警黑名单
export const deletePrometheusBlacklist = (fingerprint: string): Promise<{ [key: string]: any }> =>
  axios.delete(`alerts/blacklist/${fingerprint}`);
