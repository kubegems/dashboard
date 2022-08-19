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

// 模型版本内容
export const getModelVersionContent = (source, name, version, query = {}) =>
  axios(`sources/${source}/models/${name}/versions/${version}`, { params: query });

// 同步模型
export const postModelSync = (source, model, body = {}) => axios.post(`sources/${source}/models/${model}/sync`, body);
