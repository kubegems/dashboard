import axios from 'axios';

import { getApiVersion } from '@/utils/helpers';

// 存储类型列表
export const getStorageClassList = (clusterName, query = {}) => {
  const apiVersion = getApiVersion('storageclass', 'storage.k8s.io/v1');
  axios(`proxy/cluster/${clusterName}/${apiVersion}/storageclasses`, {
    params: query,
  });
};
// 存储类型详情
export const getStorageClassDetail = (clusterName, name) => {
  const apiVersion = getApiVersion('storageclass', 'storage.k8s.io/v1');
  axios(`proxy/cluster/${clusterName}/${apiVersion}/storageclasses/${name}`);
};
// 添加存储类型
export const postAddStorageClass = (clusterName, name, body = {}) => {
  const apiVersion = getApiVersion('storageclass', 'storage.k8s.io/v1');
  axios.post(`proxy/cluster/${clusterName}/${apiVersion}/storageclasses/${name}`, body);
};
// 更新存储类型
export const patchUpdateStorageClass = (clusterName, name, body = {}) => {
  const apiVersion = getApiVersion('storageclass', 'storage.k8s.io/v1');
  axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/storageclasses/${name}`, body);
};
// 删除存储类型
export const deleteStorageClass = (clusterName, name) => {
  const apiVersion = getApiVersion('storageclass', 'storage.k8s.io/v1');
  axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/storageclasses/${name}`);
};
