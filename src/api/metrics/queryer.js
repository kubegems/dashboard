import axios from 'axios';

// 指标查询
export const getMetricsQueryrange = (query = {}) => axios.get('/metrics/queryrange', { params: query })

// 监控标签值
export const getMetricsLabelValues = (query = {}) => axios.get('/metrics/labelvalues', { params: query })

// 获取个人监控配置
export const getMyConfigData = (name, query = {}) => axios.get(
  `my/config/${name}`,
  { params: query },
)
