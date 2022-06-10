import axios from 'axios';

// 资源列表
export const getResourceList = (clusterName, namespace, group, version, kind, query = {}) =>
  axios(`proxy/cluster/${clusterName}/${group}/${version}/namespaces/${namespace}/${kind}`, {
    params: query,
  });
// 集群资源列表
export const getClusterResourceList = (clusterName, group, version, kind, query = {}) =>
  axios(`proxy/cluster/${clusterName}/${group}/${version}/${kind}`, {
    params: query,
  });
// 资源详情
export const getResourceDetail = (clusterName, namespace, group, version, kind, name, query = {}) =>
  axios(`proxy/cluster/${clusterName}/${group}/${version}/namespaces/${namespace}/${kind}/${name}`, {
    params: query,
  });
// 集群资源详情
export const getClusterResourceDetail = (clusterName, group, version, kind, name, query = {}) =>
  axios(`proxy/cluster/${clusterName}/${group}/${version}/${kind}/${name}`, {
    params: query,
  });
// 添加资源
export const postAddResource = (clusterName, namespace, group, version, kind, name, body = {}) =>
  axios.post(`proxy/cluster/${clusterName}/${group}/${version}/namespaces/${namespace}/${kind}/${name}`, body);
// 添加集群资源
export const postAddClusterResource = (clusterName, group, version, kind, name, body = {}) =>
  axios.post(`proxy/cluster/${clusterName}/${group}/${version}/${kind}/${name}`, body);
// 更新资源
export const patchUpdateResource = (clusterName, namespace, group, version, kind, name, body = {}) =>
  axios.patch(`proxy/cluster/${clusterName}/${group}/${version}/namespaces/${namespace}/${kind}/${name}`, body);
// 更新集群资源
export const patchUpdateClusterResource = (clusterName, group, version, kind, name, body = {}) =>
  axios.patch(`proxy/cluster/${clusterName}/${group}/${version}/${kind}/${name}`, body);
// 删除资源
export const deleteResource = (clusterName, namespace, group, version, kind, name) =>
  axios.delete(`proxy/cluster/${clusterName}/${group}/${version}/namespaces/${namespace}/${kind}/${name}`);
// 删除集群资源
export const deleteClusterResource = (clusterName, group, version, kind, name) =>
  axios.delete(`proxy/cluster/${clusterName}/${group}/${version}/${kind}/${name}`);
