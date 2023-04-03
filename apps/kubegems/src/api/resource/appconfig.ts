import axios from 'axios';

export const getConfigItemsList = (
  tenant: string,
  project: string,
  environment: string,
): Promise<{ [key: string]: any }> => {
  return axios.get(`configer/tenant/${tenant}/project/${project}/environment/${environment}`, {
    params: { page: 1, size: 1000 },
  });
};

export const postPubConfigItems = (
  tenant: string,
  project: string,
  application: string,
  environment: string,
  key: string,
  val: string,
): Promise<{ [key: string]: any }> => {
  return axios.post(
    `configer/tenant/${tenant}/project/${project}/environment/${environment}/key/${key}`,
    { value: val },
    { params: { application } },
  );
};

export const getItemHistory = (
  tenant: string,
  project: string,
  application: string,
  environment: string,
  key: string,
): Promise<{ [key: string]: any }> => {
  return axios.get(`configer/tenant/${tenant}/project/${project}/environment/${environment}/key/${key}/history`, {
    params: { application },
  });
};

export const deleteConfigItems = (
  tenant: string,
  project: string,
  application: string,
  environment: string,
  key: string,
): Promise<{ [key: string]: any }> => {
  return axios.delete(`configer/tenant/${tenant}/project/${project}/environment/${environment}/key/${key}`, {
    params: { application },
  });
};

export const getItemDetail = (
  tenant: string,
  project: string,
  application: string,
  environment: string,
  key: string,
  rev: string,
): Promise<{ [key: string]: any }> => {
  return axios.get(`configer/tenant/${tenant}/project/${project}/environment/${environment}/key/${key}`, {
    params: { rev, application },
  });
};

export const getConfigBaseInfo = (
  tenant: string,
  project: string,
  environment: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  return axios.get(`configer/tenant/${tenant}/project/${project}/environment/${environment}/baseinfo`, {
    params: query,
  });
};

export const getConfigListener = (
  tenant: string,
  project: string,
  application: string,
  environment: string,
  key: string,
): Promise<{ [key: string]: any }> => {
  return axios.get(`configer/tenant/${tenant}/project/${project}/environment/${environment}/key/${key}/listener`, {
    params: { application },
  });
};
