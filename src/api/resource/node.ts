import axios from 'axios';

import { getApiVersion } from 'src/utils/helpers';

// 节点列表
export const getNodeList = (
  clusterName: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('node');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/nodes`, {
    params: query,
  });
};
// 节点详情
export const getNodeDetail = (
  clusterName: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('node');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/nodes/${name}`, {
    params: query,
  });
};
// 节点资源分配
export const getNodeResourceAllocated = (
  clusterName: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/custom/core/v1/nodes/${name}`, {
    params: query,
  });
// 节点调度
export const patchCordonNode = (
  clusterName: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.patch(`proxy/cluster/${clusterName}/custom/core/v1/nodes/${name}/actions/cordon`, body);
// 节点污点
export const patchTaintNode = (
  clusterName: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.patch(`proxy/cluster/${clusterName}/custom/core/v1/nodes/${name}/actions/taint`, body);
// 节点metadata
export const patchMetadataNode = (
  clusterName: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.patch(`proxy/cluster/${clusterName}/custom/core/v1/nodes/${name}/actions/metadata`, body);
