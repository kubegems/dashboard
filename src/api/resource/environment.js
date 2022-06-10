import axios from 'axios';

// 环境详情
export const getEnvironmentDetail = (environmentid, query = {}) =>
  axios(`environment/${environmentid}`, {
    params: Object.assign(query, {
      preload: 'Cluster,Project.Tenant,Users',
    }),
  });
// 删除环境
export const deleteEnvironment = (environmentid) => axios.delete(`environment/${environmentid}`);
// 添加环境
export const postAddEnvironment = (projectid, body = {}) => axios.post(`project/${projectid}/environment`, body);
// 更新环境
export const putUpdateEnvironment = (environmentid, body = {}) => axios.put(`environment/${environmentid}`, body);
// 环境用户列表
export const getEnvironmentUserList = (environmentid, query = {}) =>
  axios(`environment/${environmentid}/user`, { params: query });
// 添加环境用户
export const postAddEnvironmentUser = (environmentid, body = {}) =>
  axios.post(`environment/${environmentid}/user`, body);
// 删除环境用户
export const deleteEnvironmentUser = (environmentid, userid) =>
  axios.delete(`environment/${environmentid}/user/${userid}`);
// 环境quota
export const getEnvironmentQuota = (projectid, environmentid, query = {}) =>
  axios(`project/${projectid}/environment/${environmentid}/quota`, {
    params: query,
  });
// 环境租户资源quota
export const getEnvironmentTenantResourceQuota = (tenantid, query = {}) =>
  axios(`tenant/${tenantid}/environment_with_quotas`, {
    params: Object.assign(query, {
      preload: 'Creator,Project',
    }),
  });
// 环境资源使用详情
export const getEnvironmentResourceUsage = (environmentid, query = {}) =>
  axios(`environment/${environmentid}/resources`, {
    params: query,
  });
