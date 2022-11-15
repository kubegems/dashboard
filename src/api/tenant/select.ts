import axios from 'axios';

export const systemRoleSelectData = (): Promise<{ [key: string]: any }> =>
  axios(`systemrole`, { params: { size: 1000, noprocessing: true } });
export const userTenantSelectData = (
  userid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`user/${userid}/tenant`, {
    params: Object.assign(query, {
      preload: 'Users,ResourceQuotas',
      size: 1000,
      noprocessing: true,
    }),
  });
export const tenantSelectData = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`sels/tenants`, {
    params: Object.assign(query, { all: true, noprocessing: true }),
  });
export const tenantClusterSelectData = (
  tenantid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}/tenantresourcequota`, {
    params: Object.assign(query, {
      preload: 'Cluster',
      size: 1000,
    }),
  });
export const tenantEnvironmentSelectData = (
  tenantid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}/environment`, {
    params: Object.assign(query, {
      preload: 'Cluster,Project',
      size: 1000,
    }),
  });
