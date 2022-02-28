import axios from 'axios'

// 获取所有系统配置
export const getSystemAllConfigData = (query = {}) => axios.get(
  'system/config',
  { params: query },
)

// 获取系统配置
export const getSystemConfigData = (name) => axios.get(
  `system/config/${name}`,
)

// 修改系统配置
export const putSystemConfigData = (name, body = {}) => axios.put(
  `system/config/${name}`,
  body,
)

// 创建/更新prometheus模版配置
export const postPrometheusTemplate = (resourceName, ruleName, body = {}) => axios.post(
  `metrics/template/resources/${resourceName}/rules/${ruleName}`,
  body,
)

// 删除prometheus模版配置
export const deletePrometheusTemplate = (resourceName, ruleName) => axios.delete(
  `metrics/template/resources/${resourceName}/rules/${ruleName}`,
)
