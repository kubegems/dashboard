import axios from 'axios'

// 登录
export const postLogin = (body = {}, query = {}) =>
  axios.post(`login`, body, { params: query })
// 用户信息
export const getLoginUserInfo = () => axios(`my/info`)
// 用户权限
export const getLoginUserAuth = () => axios(`my/auth`)
// oauth登录地址
export const getOauthAddr = (query = {}) => axios(`/oauth/addr`, { params: query })
// 登录回调
export const getOauthCallback = (source = 'db', query = {}) =>
  axios(`/oauth/callback/${source}`, { params: query })
// 重置密码
export const postResetPassword = (body = {}) =>
  axios.post(`my/reset_password`, body)
// 三方登录
export const getSystemAuthSource = (query = {}) =>
  axios(`system/authsource`, { params: query })
