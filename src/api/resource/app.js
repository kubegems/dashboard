import axios from 'axios';

// 部署应用列表
export const getAppRunningList = (tenantid, projectid, environmentid, query = {}) =>
  axios(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications`, {
    params: query,
  });
// 部署应用商店应用列表
export const getAppStoreRunningList = (tenantid, projectid, environmentid, query = {}) =>
  axios(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/appstoreapplications`, {
    params: query,
  });
// 部署应用商店应用详情
export const getAppStoreRunningDetail = (tenantid, projectid, environmentid, name, query = {}) =>
  axios(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/resourcetree`, {
    params: query,
  });
// 部署应用详情
export const getAppRunningDetail = (tenantid, projectid, environmentid, name, query = {}) =>
  axios(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}`, {
    params: query,
  });
// 部署应用资源详情
export const getAppRunningResourceDetail = (tenantid, projectid, environmentid, name, query = {}) =>
  axios(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/argoresource`, {
    params: query,
  });
// 删除部署应用
export const deleteApp = (tenantid, projectid, environmentid, name) =>
  axios.delete(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}`);
// 添加部署应用
export const postAddApp = (tenantid, projectid, environmentid, body = {}) =>
  axios.post(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications-batch`, body);
// 删除应用商店应用
export const deleteAppStoreApp = (tenantid, projectid, environmentid, name) =>
  axios.delete(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/appstoreapplications/${name}`);
// 部署应用关联服务
export const getAppRelatedServices = (tenantid, projectid, environmentid, name, query = {}) =>
  axios(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/services`, {
    params: query,
  });
// 部署应用任务列表
export const getAppTaskList = (tenantid, projectid, environmentid, query = {}) =>
  axios(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/_/tasks`, {
    params: query,
  });
// 部署应用副本
export const getAppRunningReplicas = (tenantid, projectid, environmentid, name, query = {}) =>
  axios(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/replicas`, {
    params: query,
  });
// 部署应用扩缩容
export const postAppReplicasScale = (tenantid, projectid, environmentid, name, body = {}, query = {}) =>
  axios.post(
    `tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/replicas`,
    body,
    {
      params: query,
    },
  );
// 部署应用hpa
export const getAppRunningHPA = (tenantid, projectid, environmentid, name, query = {}) =>
  axios(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/hpa`, {
    params: query,
  });
// 添加部署应用hpa
export const postAppHPAStrategy = (tenantid, projectid, environmentid, name, body = {}) =>
  axios.post(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/hpa`, body);
// 删除部署应用hpa
export const deleteHPAStrategy = (tenantid, projectid, environmentid, name) =>
  axios.delete(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/hpa`);
