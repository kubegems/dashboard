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

import axios from 'axios';

export class RuleScope {
  constructor(scope?: { [key: string]: any }) {
    Object.assign(this, scope);
  }

  id: number;
  name: string;
  namespaced: boolean;
  resources: RuleResource[];
  showName: string;

  public async getRuleScopeList(
    tenantId: number,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<RuleScope[]>> {
    const data: { [key: string]: any } = await axios(`observability/tenant/${tenantId}/template/scopes`, {
      params: params,
    });
    return data as KubePaginationResponse<RuleScope[]>;
  }
}

export class RuleResource {
  constructor(resource?: { [key: string]: any }) {
    Object.assign(this, resource);
  }

  id: number;
  name: string;
  rules: PrometheusTemplate[];
  scopeID: number;
  showName: string;

  public async getRuleResourceList(
    tenantId: number,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<RuleResource[]>> {
    const data: { [key: string]: any } = await axios(
      `observability/tenant/${tenantId}/template/scopes/${this.scopeID}/resources`,
      { params: params },
    );
    return data as KubePaginationResponse<RuleResource[]>;
  }
}

export class PrometheusTemplate {
  constructor(template?: { [key: string]: any }) {
    Object.assign(this, template);
  }

  description: string;
  expr: string;
  id: number;
  labels: string[];
  name: string;
  resourceID: number;
  showName: string;
  tenantID: number;
  unit: string;

  public async getPrometheusTemplateList(
    tenantId: number | string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<PrometheusTemplate[]>> {
    const data: { [key: string]: any } = await axios(
      `observability/tenant/${tenantId}/template/resources/${this.resourceID}/rules`,
      { params: params },
    );
    return data as KubePaginationResponse<PrometheusTemplate[]>;
  }

  public async getPrometheusTemplate(tenantId: number | string, params: KubeRequest = {}): Promise<PrometheusTemplate> {
    const data: { [key: string]: any } = await axios(`observability/tenant/${tenantId}/template/rules/${this.id}`, {
      params: params,
    });
    return data as PrometheusTemplate;
  }

  public async addPrometheusTemplate(tenantId: number | string): Promise<PrometheusTemplate> {
    const data: { [key: string]: any } = await axios.post(`observability/tenant/${tenantId}/template/rules`, this);
    return data as PrometheusTemplate;
  }

  public async updatePrometheusTemplate(tenantId: number | string): Promise<PrometheusTemplate> {
    const data: { [key: string]: any } = await axios.put(
      `observability/tenant/${tenantId}/template/ruless/${this.id}`,
      this,
    );
    return data as PrometheusTemplate;
  }

  public async deletePrometheusTemplate(tenantId: number | string): Promise<void> {
    await axios.delete(`observability/tenant/${tenantId}/template/rules/${this.id}`);
  }
}
