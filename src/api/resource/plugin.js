import axios from 'axios';

import { PLUGIN_GROUP } from '@/utils/gvk';

// 启用插件
export const postEnablePlugin = (clusterName, name, query = {}) =>
  axios.post(
    `proxy/cluster/${clusterName}/custom/${PLUGIN_GROUP}/v1beta1/installers/${name}/actions/enable`,
    {},
    { params: query },
  );
// 关闭插件
export const postDisablePlugin = (clusterName, name, query = {}) =>
  axios.post(
    `proxy/cluster/${clusterName}/custom/${PLUGIN_GROUP}/v1beta1/installers/${name}/actions/disable`,
    {},
    { params: query },
  );
// 集群插件列表
export const getClusterPluginsList = (clusterName, query = {}) =>
  axios(`proxy/cluster/${clusterName}/custom/${PLUGIN_GROUP}/v1beta1/installers`, {
    params: query,
  });

// 全局插件
export const getPluginsList = (query = {}) =>
  axios(`plugins`, {
    params: query,
  });
