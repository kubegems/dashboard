import axios from 'axios';

import { jsonParse } from '@/utils/helpers';

const apiResources = jsonParse(window.localStorage.getItem('api-resources')) || {};
let apiVersion = apiResources['virtualservice'] || 'networking.istio.io/v1beta1';
apiVersion = apiVersion === 'v1' ? 'core/v1' : apiVersion;

// 虚拟服务详情
export const getIstioVirtualServiceDetail = (clusterName, namespace, name) =>
  axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/virtualservice/${name}`);
// 添加虚拟服务
export const postAddIstioVirtualService = (clusterName, namespace, name, body = {}) =>
  axios.post(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/virtualservice/${name}`, body);
// 更新虚拟服务
export const patchUpdateIstioVirtualService = (clusterName, namespace, name, body = {}) =>
  axios.patch(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/virtualservice/${name}`, body);
// 删除虚拟服务
export const deleteIstioVirtualService = (clusterName, namespace, name) =>
  axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/virtualservice/${name}`);
