import axios from 'axios';

// crd列表
export const getCrdList = (clusterName: string, query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/apiextensions.k8s.io/v1/customresourcedefinitions`, {
    params: query,
  });
// crd详情
export const getCrdDetail = (
  clusterName: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/apiextensions.k8s.io/v1/customresourcedefinitions/${name}`, {
    params: query,
  });
// 删除crd
export const deleteCRD = (clusterName: string, name: string): Promise<{ [key: string]: any }> =>
  axios.delete(`proxy/cluster/${clusterName}/apiextensions.k8s.io/v1/customresourcedefinitions/${name}`);
// cr列表
export const getCrList = (
  clusterName: string,
  namespace: string,
  group: string,
  version: string,
  name: string,
  scope: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(
    scope === 'Cluster'
      ? `proxy/cluster/${clusterName}/${group}/${version}/${name}`
      : `proxy/cluster/${clusterName}/${group}/${version}/namespaces/${namespace}/${name}`,
    {
      params: query,
    },
  );
// cr详情
export const getCrDetail = (
  clusterName: string,
  namespace: string,
  group: string,
  version: string,
  name: string,
  crname: string,
  scope: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(
    scope === 'Cluster'
      ? `proxy/cluster/${clusterName}/${group}/${version}/${name}/${crname}`
      : `proxy/cluster/${clusterName}/${group}/${version}/namespaces/${namespace}/${name}/${crname}`,
    {
      params: query,
    },
  );
// 添加cr
export const postAddCR = (
  clusterName: string,
  namespace: string,
  crname: string,
  group: string,
  version: string,
  name: string,
  scope: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.post(
    scope === 'Cluster'
      ? `proxy/cluster/${clusterName}/${group}/${version}/${name}/${crname}`
      : `proxy/cluster/${clusterName}/${group}/${version}/namespaces/${namespace}/${name}/${crname}`,
    body,
  );
// 更新cr
export const patchUpdateCR = (
  clusterName: string,
  namespace: string,
  crname: string,
  group: string,
  version: string,
  name: string,
  scope: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.patch(
    scope === 'Cluster'
      ? `proxy/cluster/${clusterName}/${group}/${version}/${name}/${crname}`
      : `proxy/cluster/${clusterName}/${group}/${version}/namespaces/${namespace}/${name}/${crname}`,
    body,
  );
// 删除cr
export const deleteCr = (
  clusterName: string,
  namespace: string,
  crname: string,
  group: string,
  version: string,
  name: string,
  scope: string,
): Promise<{ [key: string]: any }> =>
  axios.delete(
    scope === 'Cluster'
      ? `proxy/cluster/${clusterName}/${group}/${version}/${name}/${crname}`
      : `proxy/cluster/${clusterName}/${group}/${version}/namespaces/${namespace}/${name}/${crname}`,
  );
