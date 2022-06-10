// 页面代理
export const proxyPage = (clusterName, namespace, service, port, actionPage = null) => {
  return actionPage
    ? `/api/v1/service-proxy/cluster/${clusterName}/namespace/${namespace}/service/${service}/port/${port}/${actionPage}`
    : `/api/v1/service-proxy/cluster/${clusterName}/namespace/${namespace}/service/${service}/port/${port}/`;
};
