import axios from 'axios';

// 审计列表
export const getAuditList = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`auditlog`, {
    params: Object.assign(query, {
      preload: 'Tenant',
    }),
  });
