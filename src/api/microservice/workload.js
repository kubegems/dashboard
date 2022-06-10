import axios from 'axios';

// 微服务工作负载列表
export const getMicroAppWorkoladList = (virtualspaceid, environmentid, query = {}) =>
  axios(`virtualspace/${virtualspaceid}/environment/${environmentid}/workload`, { params: query });
// 微服务工作负载详情
export const getMicroAppWorkoladDetail = (virtualspaceid, environmentid, name, query = {}) =>
  axios(`virtualspace/${virtualspaceid}/environment/${environmentid}/workload/${name}`, {
    params: query,
  });
// 微服务工作负载注入边车
export const putInjectSideCarToMicroAppWorkolad = (virtualspaceid, environmentid, name, query = {}) =>
  axios.put(
    `virtualspace/${virtualspaceid}/environment/${environmentid}/workload/${name}/istiosidecar`,
    {},
    { params: query },
  );
