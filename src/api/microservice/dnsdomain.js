import axios from 'axios';

// dns域列表
export const getDnsDomainList = (query = {}) => axios(`virtualdomain`, { params: query });
// dns域详情
export const getDnsDomainDetail = (virtualdomainid, query = {}) =>
  axios(`virtualdomain/${virtualdomainid}`, { params: query });
// 添加dns域
export const postAddDNSDomain = (body = {}) => axios.post(`virtualdomain`, body);
// 更新dns域
export const putUpdateDNSDomain = (virtualdomainid, body = {}) => axios.put(`virtualdomain/${virtualdomainid}`, body);
// 删除dns域
export const deleteDNSDomain = (virtualdomainid) => axios.delete(`virtualdomain/${virtualdomainid}`);
