import axios from 'axios';

// 获取采集器列表
export const getMetricsTargetList = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.get(`/metrics/cluster/${clusterName}/namespaces/${namespace}/targets`, { params: query });

// 添加、更新采集器
export const postUpdateMetricsTarget = (
  clusterName: string,
  namespace: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.post(`/metrics/cluster/${clusterName}/namespaces/${namespace}/targets`, body);

// 删除
export const deleteMetricsTarget = (
  clusterName: string,
  namespace: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.delete(`/metrics/cluster/${clusterName}/namespaces/${namespace}/targets/${name}`, {
    params: query,
  });
