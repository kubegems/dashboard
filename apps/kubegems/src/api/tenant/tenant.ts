import axios from 'axios';

// 租户列表
export const getTenantList = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`tenant`, {
    params: Object.assign(query, {
      preload: 'ResourceQuotas,Users',
    }),
  });
// 租户详情
export const getTenantDetail = (
  tenantid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}`, {
    params: query,
  });
// 添加租户
export const postAddTenant = (body: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.post(`tenant`, body);
// 更新租户
export const putUpdateTenant = (tenantid: number, body: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.put(`tenant/${tenantid}`, body);
// 删除租户
export const deleteTenant = (tenantid: number): Promise<{ [key: string]: any }> => axios.delete(`tenant/${tenantid}`);
// 激活租户
export const putActiveTenant = (tenantid: number, body: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.put(`tenant/${tenantid}/action/enable`, body);
// 禁止租户
export const putForbideTenant = (
  tenantid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.put(`tenant/${tenantid}/action/disable`, body);
// 租户成员列表
export const getTenantUserList = (
  tenantid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}/user`, {
    params: Object.assign(query, {
      preload: 'SystemRole',
    }),
  });
// 增加租户成员
export const postAddTenantUser = (
  tenantid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.post(`tenant/${tenantid}/user`, body);
// 删除租户成员
export const deleteTenantUser = (tenantid: number, userid): Promise<{ [key: string]: any }> =>
  axios.delete(`tenant/${tenantid}/user/${userid}`);
// 更改租户成员
export const putChangeTenantUser = (
  tenantid: number,
  userid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.put(`tenant/${tenantid}/user/${userid}`, body);
