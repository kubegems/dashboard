import axios from 'axios';

// prometheus一级模版
export const getRuleScopeList = (
  tenantid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`observability/tenant/${tenantid}/template/scopes`, {
    params: query,
  });

// prometheus二级模版
export const getRuleResourceList = (
  tenantid: number,
  scopeid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`observability/tenant/${tenantid}/template/scopes/${scopeid}/resources`, {
    params: query,
  });

// prometheus三级模版
export const getRuleList = (
  tenantid: number,
  resourceid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`observability/tenant/${tenantid}/template/resources/${resourceid}/rules`, {
    params: query,
  });

// 创建prometheus三级模版
export const postAddRule = (tenantid: number, body: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.post(`observability/tenant/${tenantid}/template/rules`, body);

// 更新prometheus三级模版
export const putUpdateRule = (
  tenantid: number,
  ruleid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.put(`observability/tenant/${tenantid}/template/rules/${ruleid}`, body);

// 删除prometheus三级模版
export const deleteAddRule = (
  tenantid: number,
  ruleid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.delete(`observability/tenant/${tenantid}/template/rules/${ruleid}`, body);

// 获取单个prometheus三级模版
export const getRuleDetail = (
  tenantid: number,
  ruleid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`observability/tenant/${tenantid}/template/rules/${ruleid}`, {
    params: query,
  });

// prometheus三级模版搜索
export const getRuleSearch = (tenantid: number, query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`observability/tenant/${tenantid}/template/search`, {
    params: query,
  });
