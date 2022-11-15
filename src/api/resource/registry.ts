import axios from 'axios';

// 镜像仓库列表
export const getRegistryList = (
  projectid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`project/${projectid}/registry`, {
    params: Object.assign(query, {
      preload: 'Creator,Project',
    }),
  });
// 所有镜像仓库
export const getRegistryAllList = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`registry`, {
    params: Object.assign(query, {
      preload: 'Creator,Project',
    }),
  });
// 镜像仓库详情
export const getRegistryDetail = (
  projectid: number,
  registryid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`project/${projectid}/registry/${registryid}`, {
    params: query,
  });
// 添加镜像仓库
export const postAddRegistry = (
  projectid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.post(`project/${projectid}/registry`, body);
// 更新镜像仓库
export const putUpdateRegistry = (
  projectid: number,
  registryid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.put(`project/${projectid}/registry/${registryid}`, body);
// 删除镜像仓库
export const deleteRegistry = (projectid: number, registryid: number): Promise<{ [key: string]: any }> =>
  axios.delete(`project/${projectid}/registry/${registryid}`);
// 设置默认镜像仓库
export const patchSetDefaultRegistry = (
  projectid: number,
  registryid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.patch(`project/${projectid}/registry/${registryid}`, {}, { params: query });
