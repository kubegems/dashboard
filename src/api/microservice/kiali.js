import axios from 'axios';

// kiali图表
export const getKialiTrafficGraph = (virtualspaceid, environmentid, namespace, type, name, query = {}) =>
  axios(
    `virtualspace/${virtualspaceid}/environment/${environmentid}/kiali/api/namespaces/${namespace}/${type}/${name}/graph`,
    { params: query },
  );
