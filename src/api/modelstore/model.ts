import axios from 'axios';

// 模型商店列表
export const getModelStoreList = (
  source: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`sources/${source}/models`, { params: query });

// 模型商店过滤条件
export const getModelStoreFilterCondition = (
  source: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`sources/${source}/selectors`, { params: query });

// 模型商店详情页
export const getModelStoreDetail = (
  source: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`sources/${source}/models/${name}`, { params: query });

// 模型评论列表
export const getModelCommentList = (
  source: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`sources/${source}/models/${name}/comments`, { params: query });

// 模型评论
export const postModelComment = (
  source: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.post(`sources/${source}/models/${name}/comments`, body);

// 模型评论
export const putModelComment = (
  source: string,
  name: string,
  id: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.put(`sources/${source}/models/${name}/comments/${id}`, body);

// 删除模型评论
export const deleteModelComment = (source: string, name: string, id: string): Promise<{ [key: string]: any }> =>
  axios.delete(`sources/${source}/models/${name}/comments/${id}`);

// 模型平均分
export const getModelRate = (
  source: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`sources/${source}/models/${name}/rating`, { params: query });

// 模型仓库列表
export const getModelSourceList = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`sources`, { params: query });

// 模型仓库详情
export const getModelSourceDetail = (
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`sources/${name}`, { params: query });

// 模型版本内容
export const getModelVersionContent = (
  source: string,
  name: string,
  version: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`sources/${source}/models/${name}/versions/${version}`, { params: query });

// 同步模型
export const postModelSync = (
  source: string,
  model: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.post(`sources/${source}/models/${model}/sync`, body);
