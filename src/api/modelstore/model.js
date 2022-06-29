import axios from 'axios';

// 模型商店列表
export const getModelStoreList = (query = {}) => axios(`huggingface/models`, { params: query });

// 模型商店过滤条件
export const getModelStoreFilterCondition = (query = {}) => axios(`huggingface/selectors`, { params: query });

// 模型商店详情页
export const getModelStoreDetail = (name, query = {}) => axios(`huggingface/models/${name}`, { params: query });
