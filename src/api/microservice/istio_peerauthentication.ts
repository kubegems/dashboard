import axios from 'axios';

import { getApiVersion } from 'src/utils/helpers';

// 端点认证列表
export const getIstioPeerAuthenticationList = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('peerauthentication', 'security.istio.io/v1beta1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/peerauthentication`, {
    params: query,
  });
};
// 端点认证详情
export const getIstioPeerAuthenticationDetail = (
  clusterName: string,
  namespace: string,
  name: string,
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('peerauthentication', 'security.istio.io/v1beta1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/peerauthentication/${name}`);
};
// 添加端点认证
export const postAddIstioPeerAuthentication = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('peerauthentication', 'security.istio.io/v1beta1');
  return axios.post(
    `proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/peerauthentication/${name}`,
    body,
  );
};
// 更新端点认证
export const patchUpdateIstioPeerAuthentication = (
  clusterName: string,
  namespace: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('peerauthentication', 'security.istio.io/v1beta1');
  return axios.patch(
    `proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/peerauthentication/${name}`,
    body,
  );
};
// 删除端点认证
export const deleteIstioPeerAuthentication = (
  clusterName: string,
  namespace: string,
  name: string,
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('peerauthentication', 'security.istio.io/v1beta1');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/peerauthentication/${name}`);
};
