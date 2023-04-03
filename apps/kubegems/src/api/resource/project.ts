import axios from 'axios';

// 项目列表
export const getProjectList = (tenantid: number, query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}/project`, {
    params: Object.assign(query, { preload: 'Environments,Tenant' }),
  });
// 项目详情
export const getProjectDetail = (
  projectid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`/project/${projectid}`, {
    params: Object.assign(query, { preload: 'Users,Tenant' }),
  });
// 添加项目
export const postAddProject = (tenantid: number, body: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.post(`tenant/${tenantid}/project`, body);
// 更新项目
export const putUpdateProject = (
  projectid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.put(`project/${projectid}`, body);
// 删除项目
export const deleteProject = (projectid): Promise<{ [key: string]: any }> => axios.delete(`project/${projectid}`);
// 项目成员
export const getProjectUserList = (
  projectid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`project/${projectid}/user`, { params: query });
// 添加项目成员
export const postAddProjectUser = (
  projectid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.post(`project/${projectid}/user`, body);
// 删除项目成员
export const deleteProjectUser = (projectid: number, userid: number): Promise<{ [key: string]: any }> =>
  axios.delete(`project/${projectid}/user/${userid}`);
// 项目环境列表
export const getProjectEnvironmentList = (
  projectid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`project/${projectid}/environment`, {
    params: Object.assign(query, { preload: 'Project,Cluster' }),
  });
// 项目环境quota列表
export const getProjectEnvironmentQuotaList = (
  projectid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`project/${projectid}/environment/_/quotas`, { params: query });
// 租户项目quota列表
export const getTenantProjectQuotaList = (
  tenantid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`/tenant/${tenantid}/projectquotas`, { params: query });
// 项目quota
export const getProjectQuota = (
  projectid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`project/${projectid}/quota`, { params: query });
// 项目资源使用
export const getProjectResourceUsage = (
  projectid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`/project/${projectid}/resources`, { params: Object.assign(query, {}) });
// 项目环境聚合列表
export const getProjectEnvironmentAggregation = (
  projectid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`project/${projectid}/agg_environment`, {
    params: Object.assign(query, { preload: 'Creator,Project' }),
  });
// 所有项目
export const getAllProjectList = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`project`, {
    params: Object.assign(query, {
      preload: 'Tenant',
    }),
  });
