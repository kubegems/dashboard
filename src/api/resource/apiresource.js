import axios from 'axios';

// 资源列表
export const getRESTMapping = (clusterName) => axios(`proxy/cluster/${clusterName}/api-resources`);
