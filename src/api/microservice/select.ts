import axios from 'axios';

export const virtualSpaceSelectData = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`virtualspace`, {
    params: Object.assign(query, { size: 1000, noprocessing: true }),
  });
export const virtualSpaceEnvironmentSelectData = (
  virtualspaceid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`virtualspace/${virtualspaceid}/environment`, {
    params: Object.assign(query, {
      size: 1000,
      preload: 'Cluster',
      noprocessing: true,
    }),
  });
