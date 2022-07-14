import axios from 'axios';

export const getSystemAllConfigData = (query = {}) => axios.get('my/config', { params: query });

// 获取系统配置
export const getSystemConfigData = (name, query = {}) => axios.get(`my/config/${name}`, { params: query });

// 修改系统配置
export const putSystemConfigData = (name, body = {}) => axios.put(`my/config/${name}`, body);

// 创建/更新prometheus模版配置
export const postPrometheusTemplate = (resourceName, ruleName, body = {}) =>
  axios.post(`observability/template/resources/${resourceName}/rules/${ruleName}`, body);

// 删除prometheus模版配置
export const deletePrometheusTemplate = (resourceName, ruleName) =>
  axios.delete(`observability/template/resources/${resourceName}/rules/${ruleName}`);

// Oauth配置列表
export const getAuthSourceConfigList = (query = {}) => axios(`authsource`, { params: query });

// 创建Oauth配置
export const postAuthSourceConfig = (body = {}) => axios.post(`authsource`, body);

// 更新Oauth配置
export const putAuthSourceConfig = (sourceId, body = {}) => axios.put(`authsource/${sourceId}`, body);

// 删除Oauth配置
export const deleteAuthSourceConfig = (sourceId) => axios.delete(`authsource/${sourceId}`);

// 获取oauth scope
export const getOAuthScopeList = (query = {}) => axios(`system/authsource/predefined`, { params: query });
