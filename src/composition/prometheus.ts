/*
 * Copyright 2022 The kubegems.io Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useStore } from '@/store';
import { Matrix, Vector } from '@/types/prometheus';
import { PrometheusProbe } from '@/types/prometheus_probe';

const store = useStore();

export const usePrometheusProbePagination = async (
  probe: PrometheusProbe,
  cluster: string,
  pagination: KubePaginationRequest,
): Promise<Pagination<PrometheusProbe>> => {
  const _data: KubePaginationResponse<PrometheusProbe[]> = await probe.getPrometheusProbeList(cluster, {
    page: pagination.page,
    size: pagination.size,
    search: pagination.search,
  });

  return {
    items: _data.List,
    pageCount: Math.ceil(_data.Total / _data.CurrentSize),
    page: _data.CurrentPage,
    size: _data.CurrentSize,
  } as Pagination<PrometheusProbe>;
};

export const useMatrixWhitPermission = async (cluster: string, query: KubeRequest = {}): Promise<any> => {
  if (store.state.Plugins?.['monitoring'] || query.pass) {
    const data = await new Matrix().getMatrix(cluster, query);
    return data;
  }
  return [];
};

export const useVectorWhitPermission = async (cluster: string, query: KubeRequest = {}): Promise<any> => {
  if (store.state.Plugins?.['monitoring'] || query.pass) {
    const data = await new Vector().getVector(cluster, query);
    return data;
  }
  return [];
};
