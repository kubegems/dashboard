import axios from 'axios';

// 模型商店管理员列表
export const getModelStoreAdminList = (
  source: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`sources/${source}/admins`, { params: query });

// 删除模型商店管理员
export const deleteModelStoreAdminList = (source: string, username: string): Promise<{ [key: string]: any }> =>
  axios.delete(`sources/${source}/admins/${username}`);

// 添加模型商店管理员
export const postModelStoreAdminList = (
  source: string,
  username: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.post(`sources/${source}/admins/${username}`, body);
