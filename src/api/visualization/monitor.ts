import axios from 'axios';

// 监控大盘列表
export const getMonitorDashboardList = (
  environmentId: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.get(`observability/environment/${environmentId}/monitor/dashboard`, { params: query });

// 创建监控大盘
export const postAddMonitorDashboard = (
  environmentId: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.post(`observability/environment/${environmentId}/monitor/dashboard`, body);

// 更新监控大盘
export const putUpdateMonitorDashboard = (
  environmentId: number,
  dashboardId: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.put(`observability/environment/${environmentId}/monitor/dashboard/${dashboardId}`, body);

// 监控大盘详情
export const getMonitorDashboard = (
  environmentId: number,
  dashboardId: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.get(`observability/environment/${environmentId}/monitor/dashboard/${dashboardId}`, {
    params: query,
  });

// 删除监控大盘
export const deleteMonitorDashboard = (
  environmentId: number,
  dashboardId: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.delete(`observability/environment/${environmentId}/monitor/dashboard/${dashboardId}`, body);

// 监控大盘模版
export const getMonitorDashboardTemplate = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`observability/template/dashboard`, { params: query });

// 监控大盘模版详情
export const getMonitorDashboardTemplateDetail = (
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`observability/template/dashboard/${name}`, { params: query });

// 删除大盘模版
export const deleteMonitorDashboardTemplate = (
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.delete(`observability/template/dashboard/${name}`, body);

// 创建大盘模版
export const postMonitorDashboardTemplate = (body: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.post(`observability/template/dashboard`, body);

// 更新大盘模版
export const putMonitorDashboardTemplate = (
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.put(`observability/template/dashboard/${name}`, body);

// 应用性能
export const getAppPerformanceDashboard = (
  cluster: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.get(`observability/cluster/${cluster}/namespaces/${namespace}/otel/metrics/graphs`, {
    params: query,
  });
