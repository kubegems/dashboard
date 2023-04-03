import axios from 'axios';

// 告警统计
export const getAlertToday = (tenantId: number, query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.get(`observability/tenant/${tenantId}/alerts/today`, { params: query });
// 告警趋势图
export const getAlertGraph = (tenantId: number, query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.get(`observability/tenant/${tenantId}/alerts/graph`, { params: query });
// 告警分组
export const getAlertGroup = (tenantId: number, query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.get(`observability/tenant/${tenantId}/alerts/group`, { params: query });
