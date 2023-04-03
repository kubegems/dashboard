import axios from 'axios';

export const userSelectData = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`sels/users`, { params: query });
