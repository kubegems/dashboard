import axios from 'axios';

// 环境指标统计
export const getEnvironmentObservability = (
  environmentId: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.get(`/environment/${environmentId}/observability`, { params: query });
