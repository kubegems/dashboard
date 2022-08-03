import axios from 'axios';

// 集群列表
export const getClusterList = (query = {}) => axios(`cluster`, { params: query });
// 集群详情
export const getClusterDetail = (clusterid, query = {}) => axios(`cluster/${clusterid}`, { params: query });
// 添加集群
export const postAddCluster = (body = {}) => axios.post(`cluster`, body);
// 更新集群
export const putUpdateCluster = (clusterid, body = {}) => axios.put(`cluster/${clusterid}`, body);
// 删除集群
export const deleteCluster = (clusterid) => axios.delete(`cluster/${clusterid}`);
// 集群quota
export const getClusterQuota = (clusterid, query = {}) => axios(`cluster/${clusterid}/quota`, { params: query });
// 集群组件状态
export const getClusterComponentStatus = (clusterName, query = {}) =>
  axios(`proxy/cluster/${clusterName}/core/v1/componentstatuses`, {
    params: query,
  });
// 集群证书信息
export const getClusterCertInfo = (clusterName, name, query = {}) =>
  axios(`proxy/cluster/${clusterName}/custom/prometheus/v1/certinfos/${name}`, {
    params: query,
  });
// 集群状态
export const getClusterStatus = (query = {}) =>
  axios(`cluster/_/status`, {
    params: query,
  });
// 集群kubeconfig校验
export const postValidateClusterKubeConfig = (body = {}) => axios.post(`cluster/validate-kubeconfig`, body);
