import axios from 'axios'

// 证书列表
export const getCertificateList = (clusterName, namespace, query = {}) =>
  axios(
    `proxy/cluster/${clusterName}/cert-manager.io/v1/namespaces/${namespace}/certificates`,
    {
      params: query,
    },
  )
// 证书详情
export const getCertificateDetail = (clusterName, namespace, name) =>
  axios(
    `proxy/cluster/${clusterName}/cert-manager.io/v1/namespaces/${namespace}/certificates/${name}`,
  )
// 添加证书
export const postAddCertificate = (clusterName, namespace, name, body = {}) =>
  axios.post(
    `proxy/cluster/${clusterName}/cert-manager.io/v1/namespaces/${namespace}/certificates/${name}`,
    body,
  )
// 更新证书
export const patchUpdateCertificate = (clusterName, namespace, name, body = {}) =>
  axios.patch(
    `proxy/cluster/${clusterName}/cert-manager.io/v1/namespaces/${namespace}/certificates/${name}`,
    body,
  )
// 删除证书
export const deleteCertificate = (clusterName, namespace, name) =>
  axios.delete(
    `proxy/cluster/${clusterName}/cert-manager.io/v1/namespaces/${namespace}/certificates/${name}`,
  )
