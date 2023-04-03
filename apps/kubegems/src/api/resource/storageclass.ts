import { getApiVersion } from '@kubegems/libs/utils/helpers';
import axios from 'axios';

// 存储类型列表
export const getStorageClassList = (
  clusterName: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('storageclass', 'storage.k8s.io/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/storageclasses`, {
    params: query,
  });
};
// 存储类型详情
export const getStorageClassDetail = (clusterName: string, name: string): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('storageclass', 'storage.k8s.io/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/storageclasses/${name}`);
};
// 添加存储类型
export const postAddStorageClass = (
  clusterName: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('storageclass', 'storage.k8s.io/v1');
  return axios.post(`proxy/cluster/${clusterName}/${apiVersion}/storageclasses/${name}`, body);
};
// 更新存储类型
export const patchUpdateStorageClass = (
  clusterName: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('storageclass', 'storage.k8s.io/v1');
  return axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/storageclasses/${name}`, body);
};
// 删除存储类型
export const deleteStorageClass = (clusterName: string, name: string): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('storageclass', 'storage.k8s.io/v1');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/storageclasses/${name}`);
};
