import { getApiVersion } from '@kubegems/libs/utils/helpers';
import axios from 'axios';

// 存储卷快照列表
export const getVolumeSnapshotList = (
  clusterName: string,
  namespace: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('volumesnapshot', 'snapshot.storage.k8s.io/v1');
  return axios(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/volumesnapshots`, {
    params: query,
  });
};
// 添加存储卷快照
export const postAddVolumeSnapshot = (
  clusterName: string,
  namespace: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.post(`noproxy/${clusterName}/${namespace}/volumesnapshot`, body);
// 删除存储卷快照
export const deleteVolumeSnapshot = (
  clusterName: string,
  namespace: string,
  name: string,
): Promise<{ [key: string]: any }> => {
  const apiVersion = getApiVersion('volumesnapshot', 'snapshot.storage.k8s.io/v1');
  return axios.delete(`proxy/cluster/${clusterName}/${apiVersion}/namespaces/${namespace}/volumesnapshots/${name}`);
};
// 恢复存储卷快照
export const postRestoreVolumeSnapshot = (
  clusterName: string,
  namespace: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.post(`noproxy/${clusterName}/${namespace}/persistentvolumeclaim`, body);
