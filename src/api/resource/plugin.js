import axios from 'axios'
import { PLUGIN_GROUP } from '@/utils/gvk'

// 插件列表
export const getPluginList = (clusterid, query = {}) =>
  axios(`cluster/${clusterid}/plugins`, {
    params: query,
  })
// 启用插件
export const postEnablePlugin = (clusterid, name, query = {}) =>
  axios.post(
    `cluster/${clusterid}/plugins/${name}/actions/enable`,
    {},
    { params: query },
  )
// 关闭插件
export const postDisablePlugin = (clusterid, name, query = {}) =>
  axios.post(
    `cluster/${clusterid}/plugins/${name}/actions/disable`,
    {},
    { params: query },
  )
// 集群插件列表
export const getClusterPluginsList = (clusterName, query = {}) =>
  axios(
    `proxy/cluster/${clusterName}/custom/${PLUGIN_GROUP}/v1alpha1/plugins`,
    {
      params: query,
    },
  )
