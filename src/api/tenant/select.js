import axios from 'axios';

export const systemRoleSelectData = () => axios(`systemrole`, { params: { size: 1000, noprocessing: true } });
export const userTenantSelectData = (userid, query = {}) =>
  axios(`user/${userid}/tenant`, {
    params: Object.assign(query, {
      preload: 'Users,ResourceQuotas',
      size: 1000,
      noprocessing: true,
    }),
  });
export const tenantSelectData = (query = {}) =>
  axios(`sels/tenants`, {
    params: Object.assign(query, { all: true, noprocessing: true }),
  });
export const tenantClusterSelectData = (tenantid, query = {}) =>
  axios(`tenant/${tenantid}/tenantresourcequota`, {
    params: Object.assign(query, {
      preload: 'Cluster',
      size: 1000,
    }),
  });
export const tenantEnvironmentSelectData = (tenantid, query = {}) =>
  axios(`tenant/${tenantid}/environment`, {
    params: Object.assign(query, {
      preload: 'Cluster,Project',
      size: 1000,
    }),
  });
