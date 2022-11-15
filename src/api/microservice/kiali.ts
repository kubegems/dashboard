import axios from 'axios';

// kiali图表
export const getKialiTrafficGraph = (
  virtualspaceid: number,
  environmentid: number,
  namespace: string,
  type: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(
    `virtualspace/${virtualspaceid}/environment/${environmentid}/kiali/api/namespaces/${namespace}/${type}/${name}/graph`,
    { params: query },
  );
