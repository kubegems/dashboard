import axios from 'axios';

// 模型运行实例列表
export const getModelRuntimeList = (source, name, query = {}) =>
  axios(`sources/${source}/models/${name}/instances`, { params: query });

// 模型运行实例环境下pod列表
export const getModelRuntimePodList = (tenant, project, environment, query = {}) =>
  axios(`tenants/${tenant}/projects/${project}/environments/${environment}/modeldeployments`, {
    params: query,
  });

// 模型运行实例详情
export const getModelRuntimeDetail = (tenant, project, environment, name, query = {}) =>
  axios(`tenants/${tenant}/projects/${project}/environments/${environment}/modeldeployments/${name}`, {
    params: query,
  });

export const postDeployModel = (tenant, project, environment, body = {}) =>
  axios.post(`tenants/${tenant}/projects/${project}/environments/${environment}/modeldeployments`, body);
