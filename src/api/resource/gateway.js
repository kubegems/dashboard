import axios from 'axios';

// 租户网关列表
export const getGatewayList = (tenantid, clusterid, query = {}) =>
  axios(`tenant/${tenantid}/cluster/${clusterid}/tenantgateways`, {
    params: query,
  });
// 租户网关详情
export const getGatewayDetail = (tenantid, clusterid, name, query = {}) =>
  axios(`tenant/${tenantid}/cluster/${clusterid}/tenantgateways/${name}`, {
    params: query,
  });
// 添加租户网关
export const postAddGateway = (tenantid, clusterid, body = {}) =>
  axios.post(`tenant/${tenantid}/cluster/${clusterid}/tenantgateways`, body);
// 更新租户网关
export const putUpdateGateway = (tenantid, clusterid, name, body = {}) =>
  axios.put(`tenant/${tenantid}/cluster/${clusterid}/tenantgateways/${name}`, body);
// 删除租户网关
export const deleteGateway = (tenantid, clusterid, name) =>
  axios.delete(`tenant/${tenantid}/cluster/${clusterid}/tenantgateways/${name}`);
// 租户网关地址列表
export const getGatewayAddressList = (tenantid, clusterid, name, query = {}) =>
  axios(`tenant/${tenantid}/cluster/${clusterid}/tenantgateways/${name}/addresses`, {
    params: query,
  });

// 租户网关列表
export const getGatewayOriginList = (clusterName, query = {}) =>
  axios(`proxy/cluster/${clusterName}/gems.kubegems.io/v1beta1/tenantgateways`, {
    params: query,
  });
