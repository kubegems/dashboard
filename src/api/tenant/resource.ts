import axios from 'axios';

import { TENANT_RESOURCE_QUOTA_GROUP } from '@/constants/gvk';

// 租户资源quota列表
export const getTenantResourceQuotaList = (
  tenantid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}/tenantresourcequota`, {
    params: Object.assign(query, {
      preload: 'Cluster,Tenant,TenantResourceQuotaApply',
    }),
  });
// 租户资源quota详情
export const getTenantResourceQuota = (
  clusterName: string,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/${TENANT_RESOURCE_QUOTA_GROUP}/v1beta1/tenantresourcequotas/${name}`, {
    params: query,
  });
// 增加租户quota
export const postAddTenantResourceQuota = (
  tenantid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.post(`tenant/${tenantid}/tenantresourcequota`, body);
// 更新租户quota
export const putUpdateTenantResourceQuota = (
  tenantid: number,
  clusterid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.put(`tenant/${tenantid}/tenantresourcequota/${clusterid}`, body);
// 回收租户quota
export const deleteTenantResourceQuota = (tenantid: number, clusterid: number): Promise<{ [key: string]: any }> =>
  axios.delete(`tenant/${tenantid}/tenantresourcequota/${clusterid}`);
// 租户统计
export const getTenantStatistics = (
  tenantid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios(`tenant/${tenantid}/statistics`, { params: query });
// 租户资源申请
export const postTenantResourceApply = (
  tenantid: number,
  clusterid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.post(`tenant/${tenantid}/cluster/${clusterid}/resourceApply`, body);
// 租户申请详情
export const getTenantResourceApplyDetail = (tenantid: number, applyid: number): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}/tenantresourcequotaapply/${applyid}`);
