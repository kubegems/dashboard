import axios from 'axios';

import { getApiVersion } from '@/utils/helpers';

// 虚拟服务详情
export const getIstioVirtualServiceDetail = (clusterName, namespace, name) => {
  const apiVersion = getApiVersion('virtualservice', 'networking.istio.io/v1beta1');
  axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/virtualservice/${name}`);
};
// 添加虚拟服务
export const postAddIstioVirtualService = (clusterName, namespace, name, body = {}) => {
  const apiVersion = getApiVersion('virtualservice', 'networking.istio.io/v1beta1');
  axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/virtualservice/${name}`, body);
};
// 更新虚拟服务
export const patchUpdateIstioVirtualService = (clusterName, namespace, name, body = {}) => {
  const apiVersion = getApiVersion('virtualservice', 'networking.istio.io/v1beta1');
  axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/virtualservice/${name}`, body);
};
// 删除虚拟服务
export const deleteIstioVirtualService = (clusterName, namespace, name) => {
  const apiVersion = getApiVersion('virtualservice', 'networking.istio.io/v1beta1');
  axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/virtualservice/${name}`);
};
