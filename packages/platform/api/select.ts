import axios from 'axios';

export const tenantUserSelectData = (
  tenantid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}/user`, {
    params: Object.assign(query, {
      size: 1000,
      noprocessing: true,
    }),
  });
export const tenantProjectSelectData = (
  tenantid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}/project`, {
    params: Object.assign(query, {
      size: 1000,
      preload: 'Tenant',
    }),
  });
export const projectEnvironmentSelectData = (
  projectid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`project/${projectid}/environment`, {
    params: Object.assign(query, {
      preload: 'Cluster,Project',
      size: 1000,
    }),
  });
export const clusterSelectData = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`cluster`, {
    params: Object.assign(query, {
      size: 1000,
    }),
  });
export const namespaceSelectData = (
  clusterName: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/core/v1/namespaces`, {
    params: Object.assign(query, {
      preload: 'Cluster,Project',
      size: 1000,
    }),
  });
export const namespaceSelectDataFilter = (
  clusterName: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/custom/core/v1/namespaces`, {
    params: Object.assign(query, {
      preload: 'Cluster,Project',
      size: 1000,
    }),
  });

export const environmentSelectData = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`environment`, {
    params: Object.assign(query, {
      preload: 'Cluster,Project',
      size: 1000,
      noprocessing: true,
    }),
  });
export const storageClassSelectData = (
  clusterName: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/storage.k8s.io/v1/storageclasses`, {
    params: Object.assign(query, { size: 1000 }),
  });
export const secretSelectData = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/core/v1/namespaces/${namespace}/secrets`, {
    params: Object.assign(query, { size: 1000 }),
  });
export const serviceSelectData = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/core/v1/namespaces/${namespace}/services`, {
    params: Object.assign(query, { size: 1000 }),
  });
export const issuerSelectData = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/cert-manager.io/v1/namespaces/${namespace}/issuers`, {
    params: Object.assign(query, { size: 1000 }),
  });
export const gatewaySelectData = (
  tenantid: number,
  clusterid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}/cluster/${clusterid}/tenantgateways`, {
    params: Object.assign(query, { size: 1000 }),
  });
export const projectSelectData = (query: { [key: string]: any } = {}) =>
  axios(`project`, {
    params: Object.assign(query, {
      size: 1000,
      preload: 'Tenant',
      noprocessing: true,
    }),
  });
export const projectRegistrySelectData = (
  projectid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`project/${projectid}/registry`, {
    params: Object.assign(query, { size: 1000 }),
  });
export const registrySelectData = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`registry`, {
    params: Object.assign(query, { size: 1000 }),
  });
export const appSelectData = (
  tenantid: number,
  projectid: number,
  environmentid: number,
  query: { [key: string]: any } = { size: 1000, noprocessing: true, kind: 'app' },
): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications`, {
    params: query,
  });

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

export const userSelectData = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`sels/users`, { params: query });
