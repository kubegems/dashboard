import axios from 'axios';

// 平台版本信息
export const getPlatformVersion = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`version`, {
    params: query,
  });
