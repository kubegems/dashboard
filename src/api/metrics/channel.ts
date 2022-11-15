import axios from 'axios';

// 发送告警渠道测试
export const postSendTestChannel = (tenantId: number, channelId: number): Promise<{ [key: string]: any }> =>
  axios.post(`observability/tenant/${tenantId}/channels/${channelId}/test`);

// 告警渠道列表
export const getChannelList = (tenantId: number, query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`observability/tenant/${tenantId}/channels`, {
    params: query,
  });

// 告警渠道详情
export const getChannelDetail = (
  tenantId: number,
  channelId: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`observability/tenant/${tenantId}/channels/${channelId}`, {
    params: query,
  });

// 创建告警渠道
export const postAddChannel = (tenantId: number, body: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.post(`observability/tenant/${tenantId}/channels`, body);

// 更新告警渠道
export const putUpdateChannel = (tenantId: number, channelId: number, body = {}): Promise<{ [key: string]: any }> =>
  axios.put(`observability/tenant/${tenantId}/channels/${channelId}`, body);

// 删除告警渠道
export const deleteChannel = (
  tenantId: number,
  channelId: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.delete(`observability/tenant/${tenantId}/channels/${channelId}`, body);
