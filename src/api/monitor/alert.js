import axios from 'axios';

// 告警统计
export const getAlertToday = (query = {}) => axios.get(`/alerts/today`, { params: query })
// 告警趋势图
export const getAlertGraph = (query = {}) => axios.get(`/alerts/graph`, { params: query })
// 告警分组
export const getAlertGroup = (query = {}) => axios.get(`/alerts/group`, { params: query })
