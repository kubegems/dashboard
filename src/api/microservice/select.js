import axios from 'axios';

export const virtualSpaceSelectData = (query = {}) =>
  axios(`virtualspace`, {
    params: Object.assign(query, { size: 1000, noprocessing: true }),
  });
export const virtualSpaceEnvironmentSelectData = (virtualspaceid, query = {}) =>
  axios(`virtualspace/${virtualspaceid}/environment`, {
    params: Object.assign(query, {
      size: 1000,
      preload: 'Cluster',
      noprocessing: true,
    }),
  });
