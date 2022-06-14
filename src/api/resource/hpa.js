import axios from 'axios';

import { jsonParse } from '@/utils/helpers';

const apiResources = jsonParse(window.localStorage.getItem('api-resources')) || {};
let apiVersion = apiResources['horizontalpodautoscaler'] || 'autoscaling/v2beta2';
apiVersion = apiVersion === 'v1' ? 'core/v1' : apiVersion;

// hpa详情
export const getHpaDetail = (clusterName, namespace, query = {}) =>
  axios(`noproxy/${clusterName}/${namespace}/hpa`, {
    params: query,
  });
// 设置hpa
export const postSetHpa = (clusterName, namespace, body = {}) =>
  axios.post(`noproxy/${clusterName}/${namespace}/hpa`, body);
// 删除hpa
export const deleteHpa = (clusterName, namespace, name) =>
  axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/horizontalpodautoscaler/${name}`);
