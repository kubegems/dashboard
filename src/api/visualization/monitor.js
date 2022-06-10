import axios from 'axios';

// 监控大盘列表
export const getMonitorDashboardList = (environmentId, query = {}) =>
  axios.get(`observability/environment/${environmentId}/monitor/dashboard`, { params: query });

// 创建监控大盘
export const postAddMonitorDashboard = (environmentId, body = {}) =>
  axios.post(`observability/environment/${environmentId}/monitor/dashboard`, body);

// 更新监控大盘
export const putUpdateMonitorDashboard = (environmentId, dashboardId, body = {}) =>
  axios.put(`observability/environment/${environmentId}/monitor/dashboard/${dashboardId}`, body);

// 监控大盘详情
export const getMonitorDashboard = (environmentId, dashboardId, query = {}) =>
  axios.get(`observability/environment/${environmentId}/monitor/dashboard/${dashboardId}`, {
    params: query,
  });

// 删除监控大盘
export const deleteMonitorDashboard = (environmentId, dashboardId, body = {}) =>
  axios.delete(`observability/environment/${environmentId}/monitor/dashboard/${dashboardId}`, body);
