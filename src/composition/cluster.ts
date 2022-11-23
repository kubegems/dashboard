import { Cluster } from '@/types/cluster';
import { EdgeCluster } from '@/types/edge_cluster';

export const useClusterList = async (cluster: Cluster): Promise<Cluster[]> => {
  const _data: KubePaginationResponse<Cluster[]> = await cluster.getClusterList({
    page: 1,
    size: 100,
    noprocessing: true,
  });
  return _data.List as Cluster[];
};

export const useEdgeClusterList = async (edge: EdgeCluster): Promise<Cluster[]> => {
  const _data: KubePaginationResponse<EdgeCluster[]> = await edge.getEdgeClusterList({
    page: 1,
    size: 100,
    noprocessing: true,
  });
  const clusterList = _data.List.map((edge: EdgeCluster, index: number) => {
    return {
      ID: index,
      ClusterName: edge.metadata.name,
      Version: '',
      Upstream: edge.metadata.clusterName,
    };
  });
  return clusterList as Cluster[];
};

export const useEdgeClusterPagination = async (
  edge: EdgeCluster,
  page = 1,
  size = 10,
): Promise<Pagination<EdgeCluster>> => {
  const _data: KubePaginationResponse<EdgeCluster[]> = await edge.getEdgeClusterList({
    page: page,
    size: size,
    noprocessing: true,
  });

  return {
    items: _data.List,
    pageCount: Math.ceil(_data.Total / _data.CurrentSize),
    page: _data.CurrentPage,
    size: _data.CurrentSize,
  } as Pagination<EdgeCluster>;
};
