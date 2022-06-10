import axios from 'axios';

// 项目列表
export const getProjectList = (tenantid, query = {}) =>
  axios(`tenant/${tenantid}/project`, {
    params: Object.assign(query, { preload: 'Environments,Tenant' }),
  });
// 项目详情
export const getProjectDetail = (projectid, query = {}) =>
  axios(`/project/${projectid}`, {
    params: Object.assign(query, { preload: 'Users,Tenant' }),
  });
// 添加项目
export const postAddProject = (tenantid, body = {}) => axios.post(`tenant/${tenantid}/project`, body);
// 更新项目
export const putUpdateProject = (projectid, body = {}) => axios.put(`project/${projectid}`, body);
// 删除项目
export const deleteProject = (projectid) => axios.delete(`project/${projectid}`);
// 项目成员
export const getProjectUserList = (projectid, query = {}) => axios(`project/${projectid}/user`, { params: query });
// 添加项目成员
export const postAddProjectUser = (projectid, body = {}) => axios.post(`project/${projectid}/user`, body);
// 删除项目成员
export const deleteProjectUser = (projectid, userid) => axios.delete(`project/${projectid}/user/${userid}`);
// 项目环境列表
export const getProjectEnvironmentList = (projectid, query = {}) =>
  axios(`project/${projectid}/environment`, {
    params: Object.assign(query, { preload: 'Project,Cluster' }),
  });
// 项目环境quota列表
export const getProjectEnvironmentQuotaList = (projectid, query = {}) =>
  axios(`project/${projectid}/environment/_/quotas`, { params: query });
// 租户项目quota列表
export const getTenantProjectQuotaList = (tenantid, query = {}) =>
  axios(`/tenant/${tenantid}/projectquotas`, { params: query });
// 项目quota
export const getProjectQuota = (projectid, query = {}) => axios(`project/${projectid}/quota`, { params: query });
// 项目资源使用
export const getProjectResourceUsage = (projectid, query = {}) =>
  axios(`/project/${projectid}/resources`, { params: Object.assign(query, {}) });
// 项目环境聚合列表
export const getProjectEnvironmentAggregation = (projectid, query = {}) =>
  axios(`project/${projectid}/agg_environment`, {
    params: Object.assign(query, { preload: 'Creator,Project' }),
  });
// 所有项目
export const getAllProjectList = (query = {}) =>
  axios(`project`, {
    params: Object.assign(query, {
      preload: 'Tenant',
    }),
  });
