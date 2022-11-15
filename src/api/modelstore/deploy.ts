import axios from 'axios';

// 模型运行实例列表
export const getModelRuntimeList = (
  source: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`sources/${source}/models/${name}/instances`, { params: query });

// 模型运行实例环境下pod列表
export const getModelRuntimePodList = (
  tenant: string,
  project: string,
  environment: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`tenants/${tenant}/projects/${project}/environments/${environment}/modeldeployments`, {
    params: query,
  });

// 模型运行实例详情
export const getModelRuntimeDetail = (
  tenant: string,
  project: string,
  environment: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`tenants/${tenant}/projects/${project}/environments/${environment}/modeldeployments/${name}`, {
    params: query,
  });

// 更新运行实例详情
export const putModelRuntime = (
  tenant: string,
  project: string,
  environment: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.put(`tenants/${tenant}/projects/${project}/environments/${environment}/modeldeployments/${name}`, body);

// 删除运行实例详情
export const deleteModelRuntime = (
  tenant: string,
  project: string,
  environment: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.delete(`tenants/${tenant}/projects/${project}/environments/${environment}/modeldeployments/${name}`, body);

// 部署模型
export const postDeployModel = (
  tenant: string,
  project: string,
  environment: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.post(`tenants/${tenant}/projects/${project}/environments/${environment}/modeldeployments`, body);

// 模型运行实例Api
export const postModelApi = (
  environment: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.post(`${environment}/${name}/v2/models/model/infer`, body);
