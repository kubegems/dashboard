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
import { PrometheusTemplate, RuleResource, RuleScope } from '@/types/prometheus_template';

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
    items: _data.list,
    pageCount: Math.ceil(_data.total / _data.size),
    page: _data.page,
    size: _data.size,
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

export const usePrometheusTemplatePagination = async (
  tenantId: string | number,
  template: PrometheusTemplate,
  pagination: KubePaginationRequest,
): Promise<Pagination<PrometheusTemplate>> => {
  const _data: KubePaginationResponse<PrometheusTemplate[]> = await template.getPrometheusTemplateList(tenantId, {
    page: pagination.page,
    size: pagination.size,
  });

  return {
    items: _data.list,
    pageCount: Math.ceil(_data.total / _data.size),
    page: _data.page,
    size: _data.size,
  } as Pagination<PrometheusTemplate>;
};

export const useRuleScopeList = async (tenantId: number, scope: RuleScope): Promise<RuleScope[]> => {
  const _data: KubePaginationResponse<RuleScope[]> = await scope.getRuleScopeList(tenantId, {
    page: 1,
    size: 1000,
    noprocessing: true,
  });
  return _data.list as RuleScope[];
};

export const useRuleResourceList = async (tenantId: number, resource: RuleResource): Promise<RuleResource[]> => {
  const _data: KubePaginationResponse<RuleResource[]> = await resource.getRuleResourceList(tenantId, {
    page: 1,
    size: 1000,
    noprocessing: true,
  });
  return _data.list as RuleResource[];
};
