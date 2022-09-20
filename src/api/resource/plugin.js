import axios from 'axios';

// 启用插件
export const postEnablePlugin = (clusterName, name, query = {}) =>
  axios.post(`proxy/cluster/${clusterName}/plugins/${name}`, {}, { params: query });
// 关闭插件
export const deleteDisablePlugin = (clusterName, name, query = {}) =>
  axios.delete(`proxy/cluster/${clusterName}/plugins/${name}`, {}, { params: query });
// 集群插件列表
export const getClusterPluginsList = (clusterName, query = {}) =>
  axios(`proxy/cluster/${clusterName}/plugins`, {
    params: query,
  });

// 集群插件详情
export const getClusterPluginsDetail = (clusterName, name, query = {}) =>
  axios(`proxy/cluster/${clusterName}/plugins/${name}`, {
    params: query,
  });

// 全局插件
export const getPluginsList = (query = {}) =>
  axios(`plugins`, {
    params: query,
  });

// 检查插件版本
export const postCheckPluginUpdate = (clusterName, body = {}) =>
  axios.post(`proxy/cluster/${clusterName}/plugins:check-update`, body);
