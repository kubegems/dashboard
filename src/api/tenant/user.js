import axios from 'axios';

// 用户列表
export const getUserList = (query = {}) => axios(`user`, { params: Object.assign(query, { preload: 'SystemRole' }) });
// 删除用户
export const deleteUser = (userid) => axios.delete(`user/${userid}`);
// 添加用户
export const postAddUser = (body = {}) => axios.post(`user`, body);
// 更改用户角色
export const putChangeUserRole = (roleid, userid, body = {}) => axios.put(`systemrole/${roleid}/user/${userid}`, body);
// 更新用户信息
export const putUpdateUser = (body = {}) => axios.put(`user`, body);
// 重设用户密码
export const postResetUserPassword = (userid, body = {}) => axios.post(`user/${userid}/reset_password`, body);
