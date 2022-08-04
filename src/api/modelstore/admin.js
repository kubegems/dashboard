import axios from 'axios';

// 模型同步
export const postAdminModelStoreSync = (source, body = {}) => axios.post(`admin/sources/${source}/sync`, body);

// 停止模型同步
export const deleteAdminModelStoreSync = (source, body = {}) => axios.delete(`admin/sources/${source}/sync`, body);

// 模型同步状态
export const getAdminModelStoreSync = (source, query = {}) => axios(`admin/sources/${source}/sync`, { params: query });

// 模型商店列表
export const getAdminModelStoreList = (source, query = {}) =>
  axios(`admin/sources/${source}/models`, { params: query });

// 模型仓库列表
export const getAdminModelSourceList = (query = {}) => axios(`admin/sources`, { params: query });

// 模型仓库详情
export const getAdminModelSourceDetail = (name, query = {}) => axios(`admin/sources/${name}`, { params: query });

// 更新模型
export const putAdminUpdateModel = (source, name, body = {}) =>
  axios.put(`admin/sources/${source}/models/${name}`, body);

// 删除模型
export const deleteAdminModelStoreModel = (source, name, body = {}) =>
  axios.delete(`admin/sources/${source}/models/${name}`, body);

// 创建模型仓库
export const postAdminModelSource = (body = {}) => axios.post(`admin/sources`, body);

// 更新模型仓库
export const putAdminModelSource = (name, body = {}) => axios.put(`admin/sources/${name}`, body);

// 删除模型仓库
export const deleteAdminModelSource = (name) => axios.delete(`admin/sources/${name}`);

// 模型商店过滤条件
export const getAdminModelStoreFilterCondition = (source, query = {}) =>
  axios(`admin/sources/${source}/selector`, { params: query });

// 模型商店过滤条件
export const postAdminModelStorCheck = (body = {}) => axios.post(`admin/sourcescheck`, body);
