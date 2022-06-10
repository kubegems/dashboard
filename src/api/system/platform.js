import axios from 'axios';

// 平台版本信息
export const getPlatformVersion = (query = {}) =>
  axios(`version`, {
    params: query,
  });
