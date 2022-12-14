import { PrometheusProbe } from '@/types/prometheus_probe';

export const usePrometheusProbePagination = async (
  probe: PrometheusProbe,
  cluster: string,
  pagination: KubePaginationRequest,
): Promise<Pagination<PrometheusProbe>> => {
  const _data: KubePaginationResponse<PrometheusProbe[]> = await probe.getPrometheusProbeList(cluster, {
    page: pagination.page,
    size: pagination.size,
  });

  return {
    items: _data.List,
    pageCount: Math.ceil(_data.Total / _data.CurrentSize),
    page: _data.CurrentPage,
    size: _data.CurrentSize,
  } as Pagination<PrometheusProbe>;
};
