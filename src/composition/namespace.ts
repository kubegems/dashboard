import { Namespace } from '@/types/namespace';

export const useNamespacePagination = async (
  namespace: Namespace,
  cluster: string,
  page = 1,
  size = 10,
): Promise<Pagination<Namespace>> => {
  const _data: KubePaginationResponse<Namespace[]> = await namespace.getNamespaceList(cluster, {
    page: page,
    size: size,
    noprocessing: true,
  });

  return {
    items: _data.List,
    pageCount: Math.ceil(_data.Total / _data.CurrentSize),
    page: _data.CurrentPage,
    size: _data.CurrentSize,
  } as Pagination<Namespace>;
};
