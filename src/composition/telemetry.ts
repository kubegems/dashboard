import { Telemetry } from '@/types/opentelemetry';

export const useServicePagination = async (
  telemetry: Telemetry,
  cluster: string,
  namespace: string,
  page = 1,
  size = 10,
): Promise<Pagination<Telemetry>> => {
  const _data: KubePaginationResponse<Telemetry[]> = await telemetry.getServiceList(cluster, namespace, {
    page: page,
    size: size,
  });

  return {
    items: _data.List,
    pageCount: Math.ceil(_data.Total / _data.CurrentSize),
    page: _data.CurrentPage,
    size: _data.CurrentSize,
  } as Pagination<Telemetry>;
};
