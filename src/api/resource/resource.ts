import axios from 'axios';

// 资源列表
export const getResourceList = (
  clusterName: string,
  namespace: string,
  group: string,
  version: string,
  kind: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/${group}/${version}/namespaces/${namespace}/${kind}`, {
    params: query,
  });
// 集群资源列表
export const getClusterResourceList = (
  clusterName: string,
  group: string,
  version: string,
  kind: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/${group}/${version}/${kind}`, {
    params: query,
  });
// 资源详情
export const getResourceDetail = (
  clusterName: string,
  namespace: string,
  group: string,
  version: string,
  kind: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/${group}/${version}/namespaces/${namespace}/${kind}/${name}`, {
    params: query,
  });
// 集群资源详情
export const getClusterResourceDetail = (
  clusterName: string,
  group: string,
  version: string,
  kind: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/${group}/${version}/${kind}/${name}`, {
    params: query,
  });
// 添加资源
export const postAddResource = (
  clusterName: string,
  namespace: string,
  group: string,
  version: string,
  kind: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.post(`proxy/cluster/${clusterName}/${group}/${version}/namespaces/${namespace}/${kind}/${name}`, body);
// 添加集群资源
export const postAddClusterResource = (
  clusterName: string,
  group: string,
  version: string,
  kind: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.post(`proxy/cluster/${clusterName}/${group}/${version}/${kind}/${name}`, body);
// 更新资源
export const patchUpdateResource = (
  clusterName: string,
  namespace: string,
  group: string,
  version: string,
  kind: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.patch(`proxy/cluster/${clusterName}/${group}/${version}/namespaces/${namespace}/${kind}/${name}`, body);
// 更新集群资源
export const patchUpdateClusterResource = (
  clusterName: string,
  group: string,
  version: string,
  kind: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.patch(`proxy/cluster/${clusterName}/${group}/${version}/${kind}/${name}`, body);
// 删除资源
export const deleteResource = (
  clusterName: string,
  namespace: string,
  group: string,
  version: string,
  kind: string,
  name: string,
): Promise<{ [key: string]: any }> =>
  axios.delete(`proxy/cluster/${clusterName}/${group}/${version}/namespaces/${namespace}/${kind}/${name}`);
// 删除集群资源
export const deleteClusterResource = (
  clusterName: string,
  group: string,
  version: string,
  kind: string,
  name: string,
): Promise<{ [key: string]: any }> => axios.delete(`proxy/cluster/${clusterName}/${group}/${version}/${kind}/${name}`);
