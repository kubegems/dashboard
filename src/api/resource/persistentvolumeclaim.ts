import axios from 'axios';

import { getApiVersion } from '@/utils/helpers';

// 存储卷列表
export const getPersistentVolumeClaimList = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/custom/core/v1/namespaces/${namespace}/pvcs`, {
    params: query,
  });
// 存储卷详情
export const getPersistentVolumeClaimDetail = (
  clusterName: string,
  namespace: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/custom/core/v1/namespaces/${namespace}/pvcs/${name}`, {
    params: query,
  });
// 添加存储卷
export const postAddPersistentVolumeClaim = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('persistentvolumeclaim');
  return axios.post(
    `proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/persistentvolumeclaims/${name}`,
    body,
  );
};
// 更新存储卷
export const patchUpdatePersistentVolumeClaim = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('persistentvolumeclaim');
  return axios.patch(
    `proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/persistentvolumeclaims/${name}`,
    body,
  );
};
// 删除存储卷
export const deletePersistentVolumeClaim = (
  clusterName: string,
  namespace: string,
  name: string,
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('persistentvolumeclaim');
  return axios.delete(
    `proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/persistentvolumeclaims/${name}`,
  );
};
