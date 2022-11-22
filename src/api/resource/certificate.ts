import axios from 'axios';

import { getApiVersion } from '@/utils/helpers';

// 证书列表
export const getCertificateList = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('certificate', 'cert-manager.io/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/certificates`, {
    params: query,
  });
};
// 证书详情
export const getCertificateDetail = (
  clusterName: string,
  namespace: string,
  name: string,
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('certificate', 'cert-manager.io/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/certificates/${name}`);
};
// 添加证书
export const postAddCertificate = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('certificate', 'cert-manager.io/v1');
  return axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/certificates/${name}`, body);
};
// 更新证书
export const patchUpdateCertificate = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('certificate', 'cert-manager.io/v1');
  return axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/certificates/${name}`, body);
};
// 删除证书
export const deleteCertificate = (
  clusterName: string,
  namespace: string,
  name: string,
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('certificate', 'cert-manager.io/v1');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/certificates/${name}`);
};
