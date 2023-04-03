import axios from 'axios';

// 启用插件
export const postEnablePlugin = (
  clusterName: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.post(`proxy/cluster/${clusterName}/plugins/${name}`, body);
// 关闭插件
export const deleteDisablePlugin = (
  clusterName: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.delete(`proxy/cluster/${clusterName}/plugins/${name}`, body);
// 集群插件列表
export const getClusterPluginsList = (
  clusterName: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/plugins`, {
    params: query,
  });

// 集群插件详情
export const getClusterPluginsDetail = (
  clusterName: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/plugins/${name}`, {
    params: query,
  });

// 全局插件
export const getPluginsList = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`plugins`, {
    params: query,
  });

// 检查插件版本
export const postCheckPluginUpdate = (
  clusterName: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.post(`proxy/cluster/${clusterName}/plugins:check-update`, body);
