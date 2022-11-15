import axios from 'axios';

// dns域列表
export const getDnsDomainList = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`virtualdomain`, { params: query });
// dns域详情
export const getDnsDomainDetail = (
  virtualdomainid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`virtualdomain/${virtualdomainid}`, { params: query });
// 添加dns域
export const postAddDNSDomain = (body: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.post(`virtualdomain`, body);
// 更新dns域
export const putUpdateDNSDomain = (
  virtualdomainid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.put(`virtualdomain/${virtualdomainid}`, body);
// 删除dns域
export const deleteDNSDomain = (virtualdomainid: number): Promise<{ [key: string]: any }> =>
  axios.delete(`virtualdomain/${virtualdomainid}`);
