import axios from 'axios';

import { getApiVersion } from '@/utils/helpers';

const apiVersion = getApiVersion('horizontalpodautoscaler', 'autoscaling/v2beta2');

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
