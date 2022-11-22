import axios from 'axios';

import { getApiVersion } from '@/utils/helpers';

// hpa详情
export const getHpaDetail = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`noproxy/${clusterName}/${namespace}/hpa`, {
    params: query,
  });
// 设置hpa
export const postSetHpa = (
  clusterName: string,
  namespace: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.post(`noproxy/${clusterName}/${namespace}/hpa`, body);
// 删除hpa
export const deleteHpa = (clusterName: string, namespace: string, name: string): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('horizontalpodautoscaler', 'autoscaling/v2beta2');
  return axios.delete(
    `proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/horizontalpodautoscaler/${name}`,
  );
};
