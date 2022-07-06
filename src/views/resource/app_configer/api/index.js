import axios from 'axios';

export const listConfigItems = (tenant, project, environment) => {
  return axios.get(`configer/tenant/${tenant}/project/${project}/environment/${environment}`, {
    params: { page: 1, size: 1000 },
  });
};

export const pubConfigItems = (tenant, project, application, environment, key, val) => {
  return axios.post(
    `configer/tenant/${tenant}/project/${project}/environment/${environment}/key/${key}`,
    { value: val },
    { params: { application } },
  );
};

export const itemHistory = (tenant, project, application, environment, key) => {
  return axios.get(`configer/tenant/${tenant}/project/${project}/environment/${environment}/key/${key}/history`, {
    params: { application },
  });
};

export const delConfigItems = (tenant, project, application, environment, key) => {
  return axios.delete(`configer/tenant/${tenant}/project/${project}/environment/${environment}/key/${key}`, {
    params: { application },
  });
};

export const itemDetail = (tenant, project, application, environment, key, rev) => {
  return axios.get(`configer/tenant/${tenant}/project/${project}/environment/${environment}/key/${key}`, {
    params: { rev, application },
  });
};

export const baseInfo = (tenant, project, environment, query = {}) => {
  return axios.get(`configer/tenant/${tenant}/project/${project}/environment/${environment}/baseinfo`, {
    params: query,
  });
};

export const configListener = (tenant, project, application, environment, key) => {
  return axios.get(`configer/tenant/${tenant}/project/${project}/environment/${environment}/key/${key}/listener`, {
    params: { application },
  });
};
