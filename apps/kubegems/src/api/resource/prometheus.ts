import axios from 'axios';

// promtheus matrix
export const matrix = (clusterName: string, query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/custom/prometheus/v1/matrix`, {
    params: query,
  });
// promtheus vector
export const vector = (clusterName: string, query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/custom/prometheus/v1/vector`, {
    params: query,
  });
