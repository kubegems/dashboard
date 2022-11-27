import { Cluster } from '@/types/cluster';
import { EdgeCluster } from '@/types/edge_cluster';
import { stringifySelector } from '@/utils/k8s_selector';

export const useClusterList = async (cluster: Cluster): Promise<Cluster[]> => {
  const _data: KubePaginationResponse<Cluster[]> = await cluster.getClusterList({
    page: 1,
    size: 100,
    noprocessing: true,
  });
  return _data.List as Cluster[];
};

export const useEdgeClusterList = async (
  edge: EdgeCluster,
  labels: { [key: string]: string[] } = {},
): Promise<Cluster[]> => {
  const labelSelector: string = stringifySelector({
    matchExpressions: Object.keys(labels).map((key) => {
      return {
        key: key,
        operator: 'in',
        values: labels[key],
      };
    }),
  });

  const _data: KubePaginationResponse<EdgeCluster[]> = await edge.getEdgeClusterList({
    page: 1,
    size: 100,
    noprocessing: true,
    labels: labelSelector,
  });
  const clusterList = _data.List.map((edge: EdgeCluster, index: number) => {
    return {
      ID: index,
      ClusterName: edge.metadata.name,
      Version: '',
      Upstream: edge.spec.register.hubName,
    };
  });
  return clusterList as Cluster[];
};

export const useEdgeClusterPagination = async (
  edge: EdgeCluster,
  page = 1,
  size = 10,
  labels: { [key: string]: string[] } = {},
): Promise<Pagination<EdgeCluster>> => {
  const labelSelector: string = stringifySelector({
    matchExpressions: Object.keys(labels).map((key) => {
      return {
        key: key,
        operator: 'in',
        values: labels[key],
      };
    }),
  });

  const _data: KubePaginationResponse<EdgeCluster[]> = await edge.getEdgeClusterList({
    page: page,
    size: size,
    noprocessing: true,
    labels: labelSelector,
  });

  return {
    items: _data.List,
    pageCount: Math.ceil(_data.Total / _data.CurrentSize),
    page: _data.CurrentPage,
    size: _data.CurrentSize,
  } as Pagination<EdgeCluster>;
};
