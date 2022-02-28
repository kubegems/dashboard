import axios from 'axios'

// ds列表
export const getDaemonSetList = (clusterName, namespace, query = {}) =>
  axios(
    `proxy/cluster/${clusterName}/apps/v1/namespaces/${namespace}/daemonsets`,
    {
      params: query,
    },
  )
// ds详情
export const getDaemonSetDetail = (clusterName, namespace, name, query = {}) =>
  axios(
    `proxy/cluster/${clusterName}/apps/v1/namespaces/${namespace}/daemonsets/${name}`,
    { params: query },
  )
// 添加ds
export const postAddDaemonSet = (clusterName, namespace, name, body = {}) =>
  axios.post(
    `proxy/cluster/${clusterName}/apps/v1/namespaces/${namespace}/daemonsets/${name}`,
    body,
  )
// 更新ds
export const patchUpdateDaemonSet = (clusterName, namespace, name, body = {}) =>
  axios.patch(
    `proxy/cluster/${clusterName}/apps/v1/namespaces/${namespace}/daemonsets/${name}`,
    body,
  )
// 删除ds
export const deleteDaemonSet = (clusterName, namespace, name) =>
  axios.delete(
    `proxy/cluster/${clusterName}/apps/v1/namespaces/${namespace}/daemonsets/${name}`,
  )
// deploy列表
export const getDeploymentList = (clusterName, namespace, query = {}) =>
  axios(
    `proxy/cluster/${clusterName}/apps/v1/namespaces/${namespace}/deployments`,
    {
      params: query,
    },
  )
// deploy详情
export const getDeploymentDetail = (clusterName, namespace, name, query = {}) =>
  axios(
    `proxy/cluster/${clusterName}/apps/v1/namespaces/${namespace}/deployments/${name}`,
    { params: query },
  )
// 添加deploy
export const postAddDeployment = (clusterName, namespace, name, body = {}) =>
  axios.post(
    `proxy/cluster/${clusterName}/apps/v1/namespaces/${namespace}/deployments/${name}`,
    body,
  )
// 更新deploy
export const patchUpdateDeployment = (clusterName, namespace, name, body = {}) =>
  axios.patch(
    `proxy/cluster/${clusterName}/apps/v1/namespaces/${namespace}/deployments/${name}`,
    body,
  )
// 更新deploy argo
export const patchUpdateDeploymentArgo = (
  clusterName,
  namespace,
  name,
  resource,
  body = {},
) =>
  axios.patch(
    `/cluster/${clusterName}/apps/v1/namespaces/${namespace}/${resource}/${name}`,
    body,
  )
// 删除deploy
export const deleteDeployment = (clusterName, namespace, name) =>
  axios.delete(
    `proxy/cluster/${clusterName}/apps/v1/namespaces/${namespace}/deployments/${name}`,
  )
// sts列表
export const getStatefulSetList = (clusterName, namespace, query = {}) =>
  axios(
    `proxy/cluster/${clusterName}/apps/v1/namespaces/${namespace}/statefulsets`,
    {
      params: query,
    },
  )
// sts详情
export const getStatefulSetDetail = (clusterName, namespace, name, query = {}) =>
  axios(
    `proxy/cluster/${clusterName}/apps/v1/namespaces/${namespace}/statefulsets/${name}`,
    { params: query },
  )
// 添加sts
export const postAddStatefulSet = (clusterName, namespace, name, body = {}) =>
  axios.post(
    `proxy/cluster/${clusterName}/apps/v1/namespaces/${namespace}/statefulsets/${name}`,
    body,
  )
// 更新sts
export const patchUpdateStatefulSet = (clusterName, namespace, name, body = {}) =>
  axios.patch(
    `proxy/cluster/${clusterName}/apps/v1/namespaces/${namespace}/statefulsets/${name}`,
    body,
  )
// 删除sts
export const deleteStatefulSet = (clusterName, namespace, name) =>
  axios.delete(
    `proxy/cluster/${clusterName}/apps/v1/namespaces/${namespace}/statefulsets/${name}`,
  )
// 工作负载扩缩容
export const patchScaleWorkloadReplicas = (clusterName, namespace, kind, name, body = {}) =>
  axios.patch(
    `proxy/cluster/${clusterName}/apps/v1/namespaces/${namespace}/${kind}/${name}/actions/scale`,
    body,
  )
// 工作负载资源列表
export const getWorkloadResourcesList = (query = {}) =>
  axios(`resources/workload`, {
    params: query,
  })
// 删除工作负载资源建议
export const deleteWorkloadResourceAdvise = (workloadid) =>
  axios.delete(`resources/workload/${workloadid}`)
// 工作负载版本列表
export const getWorkloadVersionList = (
  clusterName,
  namespace,
  type,
  name,
  query = {},
) =>
  axios(
    `proxy/cluster/${clusterName}/custom/apps/v1/namespaces/${namespace}/${type.toLocaleLowerCase()}s/${name}/actions/rollouthistory`,
    {
      params: query,
    },
  )
// 工作负载回滚
export const postRollbackWorkload = (
  clusterName,
  namespace,
  type,
  name,
  query = {},
) =>
  axios.post(
    `proxy/cluster/${clusterName}/custom/apps/v1/namespaces/${namespace}/${type.toLocaleLowerCase()}s/${name}/actions/rollback`,
    {},
    { params: query },
  )
