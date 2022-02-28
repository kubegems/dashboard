import axios from 'axios'

// 任务列表
export const getJobList = (clusterName, namespace, query = {}) =>
  axios(
    `proxy/cluster/${clusterName}/custom/batch/v1/namespaces/${namespace}/jobs`,
    {
      params: query,
    },
  )
// 任务详情
export const getJobDetail = (clusterName, namespace, name, query = {}) =>
  axios(
    `proxy/cluster/${clusterName}/batch/v1/namespaces/${namespace}/jobs/${name}`,
    { params: query },
  )
// 添加任务
export const postAddJob = (clusterName, namespace, name, body = {}) =>
  axios.post(
    `proxy/cluster/${clusterName}/batch/v1/namespaces/${namespace}/jobs/${name}`,
    body,
  )
// 更新任务
export const patchUpdateJob = (clusterName, namespace, name, body) =>
  axios.patch(
    `proxy/cluster/${clusterName}/batch/v1/namespaces/${namespace}/jobs/${name}`,
    body,
  )
// 删除任务
export const deleteJob = (clusterName, namespace, name) =>
  axios.delete(
    `proxy/cluster/${clusterName}/batch/v1/namespaces/${namespace}/jobs/${name}`,
  )
