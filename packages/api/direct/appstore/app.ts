import axios from 'axios';

// 应用商店列表
export const getAppStoreList = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`appstore/app`, { params: query });
// 应用商店详情
export const getAppStoreDetail = (name: string, query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`appstore/app/${name}`, { params: query });
// 应用商店文件
export const getAppStoreFiles = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`appstore/files`, { params: query });
// 部署应用商店
export const postDeployAppStore = (
  tenantid: number,
  projectid: number,
  environmentid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.post(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/appstoreapplications`, body);
// 应用商店仓库列表
export const getRepositoryList = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`appstore/repo`, { params: query });
// 添加应用商店仓库
export const postAddRepository = (body: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.post(`appstore/repo`, body);
// 同步应用商店仓库
export const postSyncRepository = (name: string): Promise<{ [key: string]: any }> =>
  axios.post(`appstore/repo/${name}/actions/sync`);
// 删除应用商店仓库
export const deleteRepository = (name: string): Promise<{ [key: string]: any }> =>
  axios.delete(`appstore/repo/${name}`);
