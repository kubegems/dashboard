import axios from 'axios';

// 用户列表
export const getUserList = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`user`, { params: Object.assign(query, { preload: 'SystemRole' }) });
// 删除用户
export const deleteUser = (userid: number): Promise<{ [key: string]: any }> => axios.delete(`user/${userid}`);
// 添加用户
export const postAddUser = (body: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.post(`user`, body);
// 更改用户角色
export const putChangeUserRole = (
  roleid: number,
  userid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.put(`systemrole/${roleid}/user/${userid}`, body);
// 更新用户信息
export const putUpdateUser = (body: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.put(`user`, body);
// 重设用户密码
export const postResetUserPassword = (
  userid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.post(`user/${userid}/reset_password`, body);
