import axios from 'axios';

// 消息列表
export const getMessageList = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`message`, { params: query });
// 消息已读
export const putReadMessage = (
  messageid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.put(`message/${messageid}`, {}, { params: query });
// 审批列表
export const getApproveList = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`approve`, { params: query });
// 审批通过
export const postApprovePass = (
  approveid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.post(`approve/${approveid}/pass`, body);
// 审批驳回
export const postApproveReject = (
  approveid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.post(`approve/${approveid}/reject`, body);
