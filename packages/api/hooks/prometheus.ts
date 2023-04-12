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

import { PrometheusProbe } from '../typed/prometheus_probe';
import { PrometheusTemplate, RuleResource, RuleScope } from '../typed/prometheus_template';
import { convertResponse2List, convertResponse2Pagination } from '../utils';

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

  return convertResponse2Pagination<PrometheusProbe>(_data);
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

  return convertResponse2Pagination<PrometheusTemplate>(_data);
};

export const useRuleScopeList = async (tenantId: number, scope: RuleScope): Promise<RuleScope[]> => {
  const _data: KubePaginationResponse<RuleScope[]> = await scope.getRuleScopeList(tenantId, {
    page: 1,
    size: 1000,
    noprocessing: true,
  });
  return convertResponse2List<RuleScope>(_data);
};

export const useRuleResourceList = async (tenantId: number, resource: RuleResource): Promise<RuleResource[]> => {
  const _data: KubePaginationResponse<RuleResource[]> = await resource.getRuleResourceList(tenantId, {
    page: 1,
    size: 1000,
    noprocessing: true,
  });
  return convertResponse2List<RuleResource>(_data);
};
