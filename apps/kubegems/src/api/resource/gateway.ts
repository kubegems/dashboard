import axios from 'axios';

// 租户网关列表
export const getGatewayList = (
  tenantid: number,
  clusterid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}/cluster/${clusterid}/tenantgateways`, {
    params: query,
  });
// 租户网关详情
export const getGatewayDetail = (
  tenantid: number,
  clusterid: number,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}/cluster/${clusterid}/tenantgateways/${name}`, {
    params: query,
  });
// 添加租户网关
export const postAddGateway = (
  tenantid: number,
  clusterid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.post(`tenant/${tenantid}/cluster/${clusterid}/tenantgateways`, body);
// 更新租户网关
export const putUpdateGateway = (
  tenantid: number,
  clusterid: number,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.put(`tenant/${tenantid}/cluster/${clusterid}/tenantgateways/${name}`, body);
// 删除租户网关
export const deleteGateway = (tenantid: number, clusterid: number, name: string): Promise<{ [key: string]: any }> =>
  axios.delete(`tenant/${tenantid}/cluster/${clusterid}/tenantgateways/${name}`);
// 租户网关地址列表
export const getGatewayAddressList = (
  tenantid: number,
  clusterid: number,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}/cluster/${clusterid}/tenantgateways/${name}/addresses`, {
    params: query,
  });

// 租户网关列表
export const getGatewayOriginList = (
  clusterName: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/gems.kubegems.io/v1beta1/tenantgateways`, {
    params: query,
  });
