import axios from 'axios';

export const userSelectData = (query = {}) => axios(`sels/users`, { params: query });
