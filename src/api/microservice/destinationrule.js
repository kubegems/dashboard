import axios from 'axios';

import { getApiVersion } from '@/utils/helpers';

// 流量规则详情
export const getIstioDestinationRuleDetail = (clusterName, namespace, name) => {
  const apiVersion = getApiVersion('destinationrule', 'networking.istio.io/v1beta1');
  axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/destinationrule/${name}`);
};
// 添加流量规则
export const postAddIstioDestinationRule = (clusterName, namespace, name, body = {}) => {
  const apiVersion = getApiVersion('destinationrule', 'networking.istio.io/v1beta1');
  axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/destinationrule/${name}`, body);
};
// 更新流量规则
export const patchUpdateIstioDestinationRule = (clusterName, namespace, name, body = {}) => {
  const apiVersion = getApiVersion('destinationrule', 'networking.istio.io/v1beta1');
  axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/destinationrule/${name}`, body);
};
// 删除流量规则
export const deleteIstioDestinationRule = (clusterName, namespace, name) => {
  const apiVersion = getApiVersion('destinationrule', 'networking.istio.io/v1beta1');
  axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/destinationrule/${name}`);
};
