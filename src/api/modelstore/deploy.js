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

// 更新运行实例详情
export const putModelRuntime = (tenant, project, environment, name, body = {}) =>
  axios.put(`tenants/${tenant}/projects/${project}/environments/${environment}/modeldeployments/${name}`, body);

// 删除运行实例详情
export const deleteModelRuntime = (tenant, project, environment, name, body = {}) =>
  axios.delete(`tenants/${tenant}/projects/${project}/environments/${environment}/modeldeployments/${name}`, body);

// 部署模型
export const postDeployModel = (tenant, project, environment, body = {}) =>
  axios.post(`tenants/${tenant}/projects/${project}/environments/${environment}/modeldeployments`, body);

// 模型运行实例Api
export const postModelApi = (environment, name, body) =>
  axios.post(`${environment}/${name}/v2/models/model/infer`, body);
