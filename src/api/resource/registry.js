import axios from 'axios';

// 镜像仓库列表
export const getRegistryList = (projectid, query = {}) =>
  axios(`project/${projectid}/registry`, {
    params: Object.assign(query, {
      preload: 'Creator,Project',
    }),
  });
// 所有镜像仓库
export const getRegistryAllList = (query = {}) =>
  axios(`registry`, {
    params: Object.assign(query, {
      preload: 'Creator,Project',
    }),
  });
// 镜像仓库详情
export const getRegistryDetail = (params, query = {}) =>
  axios(`project/${params.projectid}/registry/${params.registryid}`, {
    params: query,
  });
// 添加镜像仓库
export const postAddRegistry = (params, body = {}) => axios.post(`project/${params.projectid}/registry`, body);
// 更新镜像仓库
export const putUpdateRegistry = (params, body = {}) =>
  axios.put(`project/${params.projectid}/registry/${params.registryid}`, body);
// 删除镜像仓库
export const deleteRegistry = (params) => axios.delete(`project/${params.projectid}/registry/${params.registryid}`);
// 设置默认镜像仓库
export const patchSetDefaultRegistry = (params, query = {}) =>
  axios.patch(`project/${params.projectid}/registry/${params.registryid}`, {}, { params: query });
