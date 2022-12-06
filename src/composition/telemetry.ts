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
    sortby: pagination.sortby,
  });

  return {
    items: _data.List,
    pageCount: Math.ceil(_data.Total / _data.CurrentSize),
    page: _data.CurrentPage,
    size: _data.CurrentSize,
  } as Pagination<Telemetry>;
};

export const useOperationPagination = async (
  telemetry: Telemetry,
  cluster: string,
  namespace: string,
  service: string,
  pagination: KubePaginationRequest,
): Promise<Pagination<Telemetry>> => {
  const _data: KubePaginationResponse<Telemetry[]> = await telemetry.getOperation(cluster, namespace, service, {
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

export const useTracePagination = async (
  telemetry: Telemetry,
  cluster: string,
  namespace: string,
  service: string,
  pagination: KubePaginationRequest,
): Promise<Pagination<Telemetry>> => {
  const _data: KubePaginationResponse<Telemetry[]> = await telemetry.getTrace(cluster, namespace, service, {
    page: pagination.page,
    size: pagination.size,
    start: pagination.start,
    end: pagination.end,
    maxDuration: pagination.maxDuration,
    minDuration: pagination.minDuration,
    limit: pagination.limit,
  });

  return {
    items: _data.List,
    pageCount: Math.ceil(_data.Total / _data.CurrentSize),
    page: _data.CurrentPage,
    size: _data.CurrentSize,
  } as Pagination<Telemetry>;
};
