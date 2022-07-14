import axios from 'axios';

// 租户列表
export const getTenantList = (query = {}) =>
  axios(`tenant`, {
    params: Object.assign(query, {
      preload: 'ResourceQuotas,Users',
    }),
  });
// 租户详情
export const getTenantDetail = (tenantid, query = {}) =>
  axios(`tenant/${tenantid}`, {
    params: query,
  });
// 添加租户
export const postAddTenant = (body = {}) => axios.post(`tenant`, body);
// 更新租户
export const putUpdateTenant = (tenantid, body = {}) => axios.put(`tenant/${tenantid}`, body);
// 删除租户
export const deleteTenant = (tenantid) => axios.delete(`tenant/${tenantid}`);
// 激活租户
export const putActiveTenant = (tenantid, body = {}) => axios.put(`tenant/${tenantid}/action/enable`, body);
// 禁止租户
export const putForbideTenant = (tenantid, body = {}) => axios.put(`tenant/${tenantid}/action/disable`, body);
// 租户成员列表
export const getTenantUserList = (tenantid, query = {}) =>
  axios(`tenant/${tenantid}/user`, {
    params: Object.assign(query, {
      preload: 'SystemRole',
    }),
  });
// 增加租户成员
export const postAddTenantUser = (tenantid, body = {}) => axios.post(`tenant/${tenantid}/user`, body);
// 删除租户成员
export const deleteTenantUser = (tenantid, userid) => axios.delete(`tenant/${tenantid}/user/${userid}`);
// 更改租户成员
export const putChangeTenantUser = (tenantid, userid, body = {}) =>
  axios.put(`tenant/${tenantid}/user/${userid}`, body);
