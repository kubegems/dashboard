import axios from 'axios';

// 审计列表
export const getAuditList = (query = {}) =>
  axios(`auditlog`, {
    params: Object.assign(query, {
      preload: 'Tenant',
    }),
  });
