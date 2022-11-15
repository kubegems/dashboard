import axios from 'axios';

import { getApiVersion } from 'src/utils/helpers';

// 流量规则详情
export const getIstioDestinationRuleDetail = (
  clusterName: string,
  namespace: string,
  name: string,
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('destinationrule', 'networking.istio.io/v1beta1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/destinationrule/${name}`);
};
// 添加流量规则
export const postAddIstioDestinationRule = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('destinationrule', 'networking.istio.io/v1beta1');
  return axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/destinationrule/${name}`, body);
};
// 更新流量规则
export const patchUpdateIstioDestinationRule = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('destinationrule', 'networking.istio.io/v1beta1');
  return axios.patch(
    `proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/destinationrule/${name}`,
    body,
  );
};
// 删除流量规则
export const deleteIstioDestinationRule = (
  clusterName: string,
  namespace: string,
  name: string,
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('destinationrule', 'networking.istio.io/v1beta1');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/destinationrule/${name}`);
};
