import axios from 'axios';

export const getBroadcastlist = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.get('announcement', { params: query });

export const getBroadcastDetail = (id: number, query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.get(`announcement/${id}`, { params: query });

export const postBroadcast = (body: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.post('announcement', body);

export const putBroadcast = (id: number, body: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.put(`announcement/${id}`, body);

export const deleteBroadcast = (id: number, body: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.delete(`announcement/${id}`, body);
