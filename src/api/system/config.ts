import axios from 'axios';

export const getSystemAllConfigData = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.get('my/config', { params: query });

// 修改系统配置
export const putSystemConfigData = (name: string, body: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.put(`my/config/${name}`, body);

// 创建/更新prometheus模版配置
export const postPrometheusTemplate = (
  resourceName: string,
  ruleName: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.post(`observability/template/resources/${resourceName}/rules/${ruleName}`, body);

// 删除prometheus模版配置
export const deletePrometheusTemplate = (resourceName: string, ruleName: string): Promise<{ [key: string]: any }> =>
  axios.delete(`observability/template/resources/${resourceName}/rules/${ruleName}`);

// Oauth配置列表
export const getAuthSourceConfigList = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`authsource`, { params: query });

// 创建Oauth配置
export const postAuthSourceConfig = (body: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.post(`authsource`, body);

// 更新Oauth配置
export const putAuthSourceConfig = (
  sourceId: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.put(`authsource/${sourceId}`, body);

// 删除Oauth配置
export const deleteAuthSourceConfig = (sourceId: number): Promise<{ [key: string]: any }> =>
  axios.delete(`authsource/${sourceId}`);

// 获取oauth scope
export const getOAuthScopeList = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`system/authsource/predefined`, { params: query });
