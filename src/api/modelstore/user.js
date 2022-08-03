import axios from 'axios';

// 模型商店管理员列表
export const getModelStoreAdminList = (source, query = {}) => axios(`sources/${source}/admins`, { params: query });

// 删除模型商店管理员
export const deleteModelStoreAdminList = (source, username) => axios.delete(`sources/${source}/admins/${username}`);

// 添加模型商店管理员
export const postModelStoreAdminList = (source, username, body = {}) =>
  axios.post(`sources/${source}/admins/${username}`, body);
