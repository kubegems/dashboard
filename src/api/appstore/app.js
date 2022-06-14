import axios from 'axios';

// 应用商店列表
export const getAppStoreList = (query = {}) => axios(`appstore/app`, { params: query });
// 应用商店详情
export const getAppStoreDetail = (name, query = {}) => axios(`appstore/app/${name}`, { params: query });
// 应用商店文件
export const getAppStoreFiles = (query = {}) => axios(`appstore/files`, { params: query });
// 部署应用商店
export const postDeployAppStore = (tenantid, projectid, environmentid, body = {}) =>
  axios.post(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/appstoreapplications`, body);
// 应用商店仓库列表
export const getRepositoryList = (query = {}) => axios(`appstore/repo`, { params: query });
// 添加应用商店仓库
export const postAddRepository = (body = {}) => axios.post(`appstore/repo`, body);
// 同步应用商店仓库
export const postSyncRepository = (name) => axios.post(`appstore/repo/${name}/actions/sync`);
// 删除应用商店仓库
export const deleteRepository = (name) => axios.delete(`appstore/repo/${name}`);
