import axios from 'axios';

// 告警统计
export const getAlertToday = (tenantId, query = {}) =>
  axios.get(`observability/tenant/${tenantId}/alerts/today`, { params: query });
// 告警趋势图
export const getAlertGraph = (tenantId, query = {}) =>
  axios.get(`observability/tenant/${tenantId}/alerts/graph`, { params: query });
// 告警分组
export const getAlertGroup = (tenantId, query = {}) =>
  axios.get(`observability/tenant/${tenantId}/alerts/group`, { params: query });
