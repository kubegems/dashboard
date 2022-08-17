import axios from 'axios';

// prometheus一级模版
export const getRuleScopeList = (tenantid, query = {}) =>
  axios(`observability/tenant/${tenantid}/template/scopes`, {
    params: query,
  });
