import axios from 'axios';

// prometheus一级模版
export const getRuleScopeList = (tenantid, query = {}) =>
  axios(`observability/tenant/${tenantid}/template/scopes`, {
    params: query,
  });

// prometheus二级模版
export const getRuleResourceList = (tenantid, scopeid, query = {}) =>
  axios(`observability/tenant/${tenantid}/template/scopes/${scopeid}/resources`, {
    params: query,
  });

// prometheus三级模版
export const getRuleList = (tenantid, resourceid, query = {}) =>
  axios(`observability/tenant/${tenantid}/template/resources/${resourceid}/rules`, {
    params: query,
  });

// 创建prometheus三级模版
export const postAddRule = (tenantid, body = {}) => axios.post(`observability/tenant/${tenantid}/template/rules`, body);

// 更新prometheus三级模版
export const putUpdateRule = (tenantid, ruleid, body = {}) =>
  axios.put(`observability/tenant/${tenantid}/template/rules/${ruleid}`, body);

// 删除prometheus三级模版
export const deleteAddRule = (tenantid, ruleid, body = {}) =>
  axios.delete(`observability/tenant/${tenantid}/template/rules/${ruleid}`, body);

// 获取单个prometheus三级模版
export const getRuleDetail = (tenantid, ruleid, query = {}) =>
  axios(`observability/tenant/${tenantid}/template/rules/${ruleid}`, {
    params: query,
  });

// prometheus三级模版搜索
export const getRuleSearch = (query = {}) =>
  axios(`observability/tenant/_all/template/search`, {
    params: query,
  });
