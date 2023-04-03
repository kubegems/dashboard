import axios from 'axios';

// 虚拟空间列表
export const getVirtualSpaceList = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`virtualspace`, {
    params: Object.assign(query, {
      preload: 'Environments,Users',
    }),
  });
// 虚拟空间详情
export const getVirtualSpaceDetail = (
  virtualspaceid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`virtualspace/${virtualspaceid}`, {
    params: Object.assign(query, {}),
  });
// 添加虚拟空间
export const postAddVirtualSpace = (body: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.post(`virtualspace`, body);
// 设置虚拟空间状态
export const patchSetVirtualSpaceStatus = (
  virtualspaceid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.patch(`virtualspace/${virtualspaceid}`, {}, { params: query });
// 更新虚拟空间
export const putUpdateVirtualSpace = (
  virtualspaceid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.put(`virtualspace/${virtualspaceid}`, body);
// 删除虚拟空间
export const deleteVirtualSpace = (virtualspaceid: number): Promise<{ [key: string]: any }> =>
  axios.delete(`virtualspace/${virtualspaceid}`);
// 虚拟空间成员列表
export const getVirtualSpaceUserList = (
  virtualspaceid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`virtualspace/${virtualspaceid}/user`, { params: query });
// 虚拟空间环境成员
export const getVirtualSpaceEnvironmentUser = (
  environmentid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`user/_/environment/${environmentid}`, {
    params: Object.assign(query, { size: 1000 }),
  });
// 添加虚拟空间环境
export const postAddVirtualSpaceEnvironment = (
  virtualspaceid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.post(`virtualspace/${virtualspaceid}/environment`, body);
// 删除虚拟空间环境
export const deleteVirtualSpaceEnvironment = (
  virtualspaceid: number,
  environmentid: number,
): Promise<{ [key: string]: any }> => axios.delete(`virtualspace/${virtualspaceid}/environment/${environmentid}`);
// 添加虚拟空间成员
export const postAddVirtualSpaceUser = (
  virtualspaceid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.post(`virtualspace/${virtualspaceid}/user`, body);
// 删除虚拟空间成员
export const deleteVirtualSpaceUser = (virtualspaceid: number, userid: number): Promise<{ [key: string]: any }> =>
  axios.delete(`virtualspace/${virtualspaceid}/user/${userid}`);
