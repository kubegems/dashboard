import axios from 'axios';

import { getApiVersion } from '@/utils/helpers';

// 虚拟服务详情
export const getIstioVirtualServiceDetail = (
  clusterName: string,
  namespace: string,
  name: string,
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('virtualservice', 'networking.istio.io/v1beta1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/virtualservice/${name}`);
};
// 添加虚拟服务
export const postAddIstioVirtualService = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('virtualservice', 'networking.istio.io/v1beta1');
  return axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/virtualservice/${name}`, body);
};
// 更新虚拟服务
export const patchUpdateIstioVirtualService = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('virtualservice', 'networking.istio.io/v1beta1');
  return axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/virtualservice/${name}`, body);
};
// 删除虚拟服务
export const deleteIstioVirtualService = (
  clusterName: string,
  namespace: string,
  name: string,
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('virtualservice', 'networking.istio.io/v1beta1');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/virtualservice/${name}`);
};
