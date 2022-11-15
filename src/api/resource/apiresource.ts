import axios from 'axios';

// 资源列表
export const getRESTMapping = (clusterName: string): Promise<{ [key: string]: any }> =>
  axios(`proxy/cluster/${clusterName}/api-resources`);
