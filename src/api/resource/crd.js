import axios from 'axios';

// crd列表
export const getCrdList = (clusterName, query = {}) =>
  axios(`proxy/cluster/${clusterName}/apiextensions.k8s.io/v1/customresourcedefinitions`, {
    params: query,
  });
// crd详情
export const getCrdDetail = (clusterName, name, query = {}) =>
  axios(`proxy/cluster/${clusterName}/apiextensions.k8s.io/v1/customresourcedefinitions/${name}`, {
    params: query,
  });
// 删除crd
export const deleteCRD = (clusterName, name) =>
  axios.delete(`proxy/cluster/${clusterName}/apiextensions.k8s.io/v1/customresourcedefinitions/${name}`);
// cr列表
export const getCrList = (clusterName, namespace, group, version, name, scope, query = {}) =>
  axios(
    scope === 'Cluster'
      ? `proxy/cluster/${clusterName}/${group}/${version}/${name}`
      : `proxy/cluster/${clusterName}/${group}/${version}/namespaces/${namespace}/${name}`,
    {
      params: query,
    },
  );
// cr详情
export const getCrDetail = (clusterName, namespace, group, version, name, crname, scope, query = {}) =>
  axios(
    scope === 'Cluster'
      ? `proxy/cluster/${clusterName}/${group}/${version}/${name}/${crname}`
      : `proxy/cluster/${clusterName}/${group}/${version}/namespaces/${namespace}/${name}/${crname}`,
    {
      params: query,
    },
  );
// 添加cr
export const postAddCR = (clusterName, namespace, crname, group, version, name, scope, body = {}) =>
  axios.post(
    scope === 'Cluster'
      ? `proxy/cluster/${clusterName}/${group}/${version}/${name}/${crname}`
      : `proxy/cluster/${clusterName}/${group}/${version}/namespaces/${namespace}/${name}/${crname}`,
    body,
  );
// 更新cr
export const patchUpdateCR = (clusterName, namespace, crname, group, version, name, scope, body = {}) =>
  axios.patch(
    scope === 'Cluster'
      ? `proxy/cluster/${clusterName}/${group}/${version}/${name}/${crname}`
      : `proxy/cluster/${clusterName}/${group}/${version}/namespaces/${namespace}/${name}/${crname}`,
    body,
  );
// 删除cr
export const deleteCr = (clusterName, namespace, crname, group, version, name, scope) =>
  axios.delete(
    scope === 'Cluster'
      ? `proxy/cluster/${clusterName}/${group}/${version}/${name}/${crname}`
      : `proxy/cluster/${clusterName}/${group}/${version}/namespaces/${namespace}/${name}/${crname}`,
  );
