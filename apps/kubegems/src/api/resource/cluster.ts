import axios from 'axios';

// 集群列表
export const getClusterList = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`cluster`, { params: query });
// 集群详情
export const getClusterDetail = (
  clusterid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`cluster/${clusterid}`, { params: query });
// 添加集群
export const postAddCluster = (body: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.post(`cluster`, body);
// 更新集群
export const putUpdateCluster = (
  clusterid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.put(`cluster/${clusterid}`, body);
// 删除集群
export const deleteCluster = (clusterid: number): Promise<{ [key: string]: any }> =>
  axios.delete(`cluster/${clusterid}`);
// 集群quota
export const getClusterQuota = (
  clusterid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`cluster/${clusterid}/quota`, { params: query });
// 集群组件状态
export const getClusterComponentStatus = (
  clusterName: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/core/v1/componentstatuses`, {
    params: query,
  });
// 集群证书信息
export const getClusterCertInfo = (
  clusterName: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/custom/prometheus/v1/certinfos/${name}`, {
    params: query,
  });
// 集群状态
export const getClusterStatus = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`cluster/_/status`, {
    params: query,
  });
// 集群kubeconfig校验
export const postValidateClusterKubeConfig = (body: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios.post(`cluster/validate-kubeconfig`, body);
