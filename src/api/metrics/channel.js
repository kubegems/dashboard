import axios from 'axios';

// 发送告警渠道测试
export const postSendTestChannel = (tenantId, channelId) =>
  axios.post(`observability/tenant/${tenantId}/channels/${channelId}/test`);

// 告警渠道列表
export const getChannelList = (tenantId, query = {}) =>
  axios(`observability/tenant/${tenantId}/channels`, {
    params: query,
  });

// 告警渠道详情
export const getChannelDetail = (tenantId, channelId, query = {}) =>
  axios(`observability/tenant/${tenantId}/channels/${channelId}`, {
    params: query,
  });

// 创建告警渠道
export const postAddChannel = (tenantId, body = {}) => axios.post(`observability/tenant/${tenantId}/channels`, body);

// 更新告警渠道
export const putUpdateChannel = (tenantId, channelId, body = {}) =>
  axios.put(`observability/tenant/${tenantId}/channels/${channelId}`, body);

// 删除告警渠道
export const deleteChannel = (tenantId, channelId, body = {}) =>
  axios.delete(`observability/tenant/${tenantId}/channels/${channelId}`, body);
