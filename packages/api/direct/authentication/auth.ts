import axios from 'axios';

// 登录
export const postLogin = (
  body: { [key: string]: any } = {},
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.post(`login`, body, { params: query });
// 用户信息
export const getLoginUserInfo = (): Promise<{ [key: string]: any }> => axios(`my/info`);
// 用户权限
export const getLoginUserAuth = (): Promise<{ [key: string]: any }> => axios(`my/auth`);
// oauth登录地址
export const getOauthAddr = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`/oauth/addr`, { params: query });
// 登录回调
export const getOauthCallback = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`/oauth/callback`, { params: query });
// 重置密码
export const postResetPassword = (body: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.post(`my/reset_password`, body);
// 三方登录
export const getSystemAuthSource = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`system/authsource`, { params: query });
// 生成token
export const postGenerateToken = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.post(`oauth/token`, {}, { params: query });

// 获取token
export const getTokenList = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`oauth/token`, { params: query });

// 删除token
export const deleteToken = (tokenId: number, body: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.delete(`oauth/token/${tokenId}`, body);
