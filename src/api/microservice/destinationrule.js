import axios from 'axios';

import { jsonParse } from '@/utils/helpers';

const apiResources = jsonParse(window.localStorage.getItem('api-resources')) || {};
let apiVersion = apiResources['destinationrule'] || 'networking.istio.io/v1beta1';
apiVersion = apiVersion === 'v1' ? 'core/v1' : apiVersion;

// 流量规则详情
export const getIstioDestinationRuleDetail = (clusterName, namespace, name) =>
  axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/destinationrule/${name}`);
// 添加流量规则
export const postAddIstioDestinationRule = (clusterName, namespace, name, body = {}) =>
  axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/destinationrule/${name}`, body);
// 更新流量规则
export const patchUpdateIstioDestinationRule = (clusterName, namespace, name, body = {}) =>
  axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/destinationrule/${name}`, body);
// 删除流量规则
export const deleteIstioDestinationRule = (clusterName, namespace, name) =>
  axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/destinationrule/${name}`);
