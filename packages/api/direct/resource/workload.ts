import axios from 'axios';

// 更新deploy argo
export const patchUpdateDeploymentArgo = (
  clusterName: string,
  namespace: string,
  name: string,
  resource: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.patch(`/cluster/${clusterName}/apps/v1/namespaces/${namespace}/${resource}/${name}`, body);

// 工作负载扩缩容
export const patchScaleWorkloadReplicas = (
  clusterName: string,
  namespace: string,
  kind: string,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.patch(`proxy/cluster/${clusterName}/apps/v1/namespaces/${namespace}/${kind}/${name}/actions/scale`, body);
// 工作负载资源列表
export const getWorkloadResourcesList = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`resources/workload`, {
    params: query,
  });
// 删除工作负载资源建议
export const deleteWorkloadResourceAdvise = (workloadid: number): Promise<{ [key: string]: any }> =>
  axios.delete(`resources/workload/${workloadid}`);
// 工作负载版本列表
export const getWorkloadVersionList = (
  clusterName: string,
  namespace: string,
  type: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(
    `proxy/cluster/${clusterName}/custom/apps/v1/namespaces/${namespace}/${type.toLocaleLowerCase()}s/${name}/actions/rollouthistory`,
    {
      params: query,
    },
  );
// 工作负载回滚
export const postRollbackWorkload = (
  clusterName: string,
  namespace: string,
  type: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.post(
    `proxy/cluster/${clusterName}/custom/apps/v1/namespaces/${namespace}/${type.toLocaleLowerCase()}s/${name}/actions/rollback`,
    {},
    { params: query },
  );
