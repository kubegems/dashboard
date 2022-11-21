import { Cluster } from '@/types/cluster';

export const useClusterPagination = async (cluster: Cluster, page = 1, size = 10): Promise<Cluster[]> => {
  const _data: KubePaginationResponse<Cluster[]> = await cluster.getClusterList({
    page: page,
    size: size,
    noprocessing: true,
  });
  return _data.List as Cluster[];
};
