import axios from 'axios';

import { getApiVersion } from '@/utils/helpers';

const apiVersion = getApiVersion('volumesnapshot', 'snapshot.storage.k8s.io/v1');

// 存储卷快照列表
export const getVolumeSnapshotList = (clusterName, namespace, query = {}) =>
  axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/volumesnapshots`, {
    params: query,
  });
// 添加存储卷快照
export const postAddVolumeSnapshot = (clusterName, namespace, body = {}) =>
  axios.post(`noproxy/${clusterName}/${namespace}/volumesnapshot`, body);
// 删除存储卷快照
export const deleteVolumeSnapshot = (clusterName, namespace, name) =>
  axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/volumesnapshots/${name}`);
// 恢复存储卷快照
export const postRestoreVolumeSnapshot = (clusterName, namespace, body = {}) =>
  axios.post(`noproxy/${clusterName}/${namespace}/persistentvolumeclaim`, body);
