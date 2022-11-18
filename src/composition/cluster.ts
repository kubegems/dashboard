import { Cluster } from 'src/types/cluster';

export const useClusterPagination = async (page = 1, size = 10): Promise<Cluster[]> => {
  const cluster = new Cluster();
  const _data: KubePaginationResponse<Cluster[]> = await cluster.getClusterList({
    page: page,
    size: size,
    noprocessing: true,
  });
  return _data.List;
};
