import axios from 'axios';

// 获取采集器列表
export const getMetricsTargetList = (clusterName, namespace, query = {}) =>
  axios.get(`/metrics/cluster/${clusterName}/namespaces/${namespace}/targets`, { params: query });

// 添加、更新采集器
export const postUpdateMetricsTarget = (clusterName, namespace, body = {}) =>
  axios.post(`/metrics/cluster/${clusterName}/namespaces/${namespace}/targets`, body);

// 删除
export const deleteMetricsTarget = (clusterName, namespace, name, query = {}) =>
  axios.delete(`/metrics/cluster/${clusterName}/namespaces/${namespace}/targets/${name}`, {
    params: query,
  });
