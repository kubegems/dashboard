import axios from 'axios';

// 部署应用列表
export const getAppRunningList = (
  tenantid: number,
  projectid: number,
  environmentid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications`, {
    params: query,
  });
// 部署应用商店应用列表
export const getAppStoreRunningList = (
  tenantid: number,
  projectid: number,
  environmentid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/appstoreapplications`, {
    params: query,
  });
// 部署应用商店应用详情
export const getAppStoreRunningDetail = (
  tenantid: number,
  projectid: number,
  environmentid: number,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/resourcetree`, {
    params: query,
  });
// 部署应用详情
export const getAppRunningDetail = (
  tenantid: number,
  projectid: number,
  environmentid: number,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}`, {
    params: query,
  });
// 部署应用资源详情
export const getAppRunningResourceDetail = (
  tenantid: number,
  projectid: number,
  environmentid: number,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/argoresource`, {
    params: query,
  });
// 删除部署应用
export const deleteApp = (
  tenantid: number,
  projectid: number,
  environmentid: number,
  name: string,
): Promise<{ [key: string]: any }> =>
  axios.delete(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}`);
// 添加部署应用
export const postAddApp = (
  tenantid: number,
  projectid: number,
  environmentid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.post(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications-batch`, body);
// 删除应用商店应用
export const deleteAppStoreApp = (
  tenantid: number,
  projectid: number,
  environmentid: number,
  name: string,
): Promise<{ [key: string]: any }> =>
  axios.delete(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/appstoreapplications/${name}`);
// 部署应用关联服务
export const getAppRelatedServices = (
  tenantid: number,
  projectid: number,
  environmentid: number,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/services`, {
    params: query,
  });
// 部署应用任务列表
export const getAppTaskList = (
  tenantid: number,
  projectid: number,
  environmentid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/_/tasks`, {
    params: query,
  });
// 部署应用副本
export const getAppRunningReplicas = (
  tenantid: number,
  projectid: number,
  environmentid: number,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/replicas`, {
    params: query,
  });
// 部署应用扩缩容
export const postAppReplicasScale = (
  tenantid: number,
  projectid: number,
  environmentid: number,
  name: string,
  body: { [key: string]: any } = {},
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.post(
    `tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/replicas`,
    body,
    {
      params: query,
    },
  );
// 部署应用hpa
export const getAppRunningHPA = (
  tenantid: number,
  projectid: number,
  environmentid: number,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/hpa`, {
    params: query,
  });
// 添加部署应用hpa
export const postAppHPAStrategy = (
  tenantid: number,
  projectid: number,
  environmentid: number,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.post(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/hpa`, body);
// 删除部署应用hpa
export const deleteHPAStrategy = (
  tenantid: number,
  projectid: number,
  environmentid: number,
  name: string,
): Promise<{ [key: string]: any }> =>
  axios.delete(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/hpa`);
