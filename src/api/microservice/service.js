import axios from 'axios';

// 微服务列表
export const getMicroServiceList = (virtualspaceid, environmentid, query = {}) =>
  axios(`virtualspace/${virtualspaceid}/environment/${environmentid}/service`, {
    params: query,
  });
// 微服务详情
export const getMicroServiceDetail = (virtualspaceid, environmentid, name, query = {}) =>
  axios(`virtualspace/${virtualspaceid}/environment/${environmentid}/service/${name}`, {
    params: query,
  });
// 添加故障注入
export const postAddFaultInjection = (virtualspaceid, environmentid, name, body = {}) =>
  axios.post(`virtualspace/${virtualspaceid}/environment/${environmentid}/service/${name}/fault_injection`, body);
// 添加请求路由
export const postAddRequestRouting = (virtualspaceid, environmentid, name, body = {}) =>
  axios.post(`virtualspace/${virtualspaceid}/environment/${environmentid}/service/${name}/request_routing`, body);
// 添加请求耗时
export const postAddRequestTimeouts = (virtualspaceid, environmentid, name, body = {}) =>
  axios.post(`virtualspace/${virtualspaceid}/environment/${environmentid}/service/${name}/request_timeouts`, body);
// 添加tcp流量切换
export const postAddTcpTrafficShifting = (virtualspaceid, environmentid, name, body = {}) =>
  axios.post(`virtualspace/${virtualspaceid}/environment/${environmentid}/service/${name}/tcp_traffic_shifting`, body);
// 添加流量切换
export const postAddTrafficShifting = (virtualspaceid, environmentid, name, body = {}) =>
  axios.post(`virtualspace/${virtualspaceid}/environment/${environmentid}/service/${name}/traffic_shifting`, body);
// 重置服务
export const postResetService = (virtualspaceid, environmentid, name, body) =>
  axios.post(`virtualspace/${virtualspaceid}/environment/${environmentid}/service/${name}/reset`, body);
