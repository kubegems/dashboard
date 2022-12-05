import { Telemetry } from '@/types/opentelemetry';

export const useServicePagination = async (
  telemetry: Telemetry,
  cluster: string,
  namespace: string,
  pagination: KubePaginationRequest,
): Promise<Pagination<Telemetry>> => {
  const _data: KubePaginationResponse<Telemetry[]> = await telemetry.getServiceList(cluster, namespace, {
    page: pagination.page,
    size: pagination.size,
    start: pagination.start,
    end: pagination.end,
  });

  return {
    items: _data.List,
    pageCount: Math.ceil(_data.Total / _data.CurrentSize),
    page: _data.CurrentPage,
    size: _data.CurrentSize,
  } as Pagination<Telemetry>;
};
