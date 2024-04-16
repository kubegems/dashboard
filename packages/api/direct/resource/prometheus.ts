import axios from 'axios';

// promtheus matrix
export const matrix = (clusterName: string, query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> => {
  const start = query.start;
  const end = query.end;
  if (start && end) {
    const millseconds = new Date(end) - new Date(start);
    if (millseconds < 1000 * 60 * 60 * 24) {
      query.step = millseconds / 1000 / 60;
    } else if (millseconds > 1000 * 60 * 60 * 24) {
      query.step = millseconds / 1000 / 900;
      if (query.step > 600) query.step = 600;
    } else {
      query.step = millseconds / 1000 / 300;
    }
  }
  return axios(`proxy/cluster/${clusterName}/custom/prometheus/v1/matrix`, {
    params: query,
  });
};
// promtheus vector
export const vector = (clusterName: string, query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/custom/prometheus/v1/vector`, {
    params: query,
  });
