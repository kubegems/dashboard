import axios from 'axios'

// 登录
export const postLogin = (body = {}, query = {}) =>
  axios.post(`login`, body, { params: query })
// 用户信息
export const getLoginUserInfo = () => axios(`my/info`)
// 用户权限
export const getLoginUserAuth = () => axios(`my/auth`)
// oauth登录地址
export const getOauthAddr = () => axios(`/oauth/addr`)
// 登录回调
export const getOauthCallback = (query = {}) =>
  axios(`/oauth/callback`, { params: query })
// 重置密码
export const postResetPassword = (body = {}) =>
  axios.post(`my/reset_password`, body)
