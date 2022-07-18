import axios from 'axios';

// 模型商店列表
export const getModelStoreList = (source, query = {}) => axios(`sources/${source}/models`, { params: query });

// 模型商店过滤条件
export const getModelStoreFilterCondition = (source, query = {}) =>
  axios(`sources/${source}/selectors`, { params: query });

// 模型商店详情页
export const getModelStoreDetail = (source, name, query = {}) =>
  axios(`sources/${source}/models/${name}`, { params: query });

// 模型评论列表
export const getModelCommentList = (source, name, query = {}) =>
  axios(`sources/${source}/models/${name}/comments`, { params: query });

// 模型评论
export const postModelComment = (source, name, body = {}) =>
  axios.post(`sources/${source}/models/${name}/comments`, body);

// 更新模型
export const putUpdateModel = (source, name, body = {}) => axios.put(`sources/${source}/models/${name}`, body);

// 模型评论
export const putModelComment = (source, name, id, body = {}) =>
  axios.put(`sources/${source}/models/${name}/comments/${id}`, body);

// 删除模型评论
export const deleteModelComment = (source, name, id) => axios.delete(`sources/${source}/models/${name}/comments/${id}`);

// 模型平均分
export const getModelRate = (source, name, query = {}) =>
  axios(`sources/${source}/models/${name}/rating`, { params: query });

// 模型仓库列表
export const getModelSourceList = (query = {}) => axios(`sources`, { params: query });

// 模型仓库详情
export const getModelSourceDetail = (name, query = {}) => axios(`sources/${name}`, { params: query });

// 创建模型仓库
export const postModelSource = (body = {}) => axios.post(`sources`, body);

// 更新模型仓库
export const putModelSource = (name, body = {}) => axios.put(`sources/${name}`, body);

// 删除模型仓库
export const deleteModelSource = (name) => axios.delete(`sources/${name}`);

// 模型同步
export const postModelStoreSync = (source, body = {}) => axios.post(`sources/${source}/sync`, body);

// 停止模型同步
export const deleteModelStoreSync = (source, body = {}) => axios.delete(`sources/${source}/sync`, body);

// 模型同步状态
export const getModelStoreSync = (source, query = {}) => axios(`sources/${source}/sync`, { params: query });
