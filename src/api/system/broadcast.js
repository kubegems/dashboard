import axios from 'axios';

export const getBroadcastlist = (query = {}) => axios.get('announcement', { params: query });

export const getBroadcastDetail = (id, query = {}) => axios.get(`announcement/${id}`, { params: query });

export const postBroadcast = (body = {}) => axios.post('announcement', body);

export const putBroadcast = (id, body = {}) => axios.put(`announcement/${id}`, body);

export const deleteBroadcast = (id, body = {}) => axios.delete(`announcement/${id}`, body);
