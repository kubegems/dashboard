import axios from 'axios';

// 消息列表
export const getMessageList = (query = {}) => axios(`message`, { params: query });
// 消息已读
export const putReadMessage = (messageid, query = {}) => axios.put(`message/${messageid}`, {}, { params: query });
// 审批列表
export const getApproveList = (query = {}) => axios(`approve`, { params: query });
// 审批通过
export const postApprovePass = (approveid, body = {}) => axios.post(`approve/${approveid}/pass`, body);
// 审批驳回
export const postApproveReject = (approveid, body = {}) => axios.post(`approve/${approveid}/reject`, body);
