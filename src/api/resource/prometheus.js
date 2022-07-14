import axios from 'axios';

// promtheus matrix
export const matrix = (clusterName, query = {}) =>
  axios(`proxy/cluster/${clusterName}/custom/prometheus/v1/matrix`, {
    params: query,
  });
// promtheus vector
export const vector = (clusterName, query = {}) =>
  axios(`proxy/cluster/${clusterName}/custom/prometheus/v1/vector`, {
    params: query,
  });
