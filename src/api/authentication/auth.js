import axios from 'axios';

// 登录
export const postLogin = (body = {}, query = {}) => axios.post(`login`, body, { params: query });
// 用户信息
export const getLoginUserInfo = () => axios(`my/info`);
// 用户权限
export const getLoginUserAuth = () => axios(`my/auth`);
// oauth登录地址
export const getOauthAddr = (query = {}) => axios(`/oauth/addr`, { params: query });
// 登录回调
export const getOauthCallback = (query = {}) => axios(`/oauth/callback`, { params: query });
// 重置密码
export const postResetPassword = (body = {}) => axios.post(`my/reset_password`, body);
// 三方登录
export const getSystemAuthSource = (query = {}) => axios(`system/authsource`, { params: query });
// 生成token
export const postGenerateToken = (query = {}) => axios.post(`oauth/token`, {}, { params: query });

// 获取token
export const getTokenList = (query = {}) => axios(`oauth/token`, { params: query });

// 删除token
export const deleteToken = (tokenId, body = {}) => axios.delete(`oauth/token/${tokenId}`, body);
