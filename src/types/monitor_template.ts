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

import { TemplateGraph } from './monitor';

export class MonitorTemplate {
  constructor(template?: { [key: string]: any }) {
    Object.assign(this, template);
  }

  description: string;
  end: string;
  graphs: TemplateGraph[];
  name: string;
  refresh: string;
  start: string;
  step: string;
  variables: { [key: string]: string };

  public async getMonitorTemplateList(
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<MonitorTemplate[]>> {
    const data: { [key: string]: any } = await axios(`observability/template/dashboard`, { params: params });
    return data as KubePaginationResponse<MonitorTemplate[]>;
  }

  public async getMonitorTemplate(params: KubeRequest = {}): Promise<MonitorTemplate> {
    const data: { [key: string]: any } = await axios(`observability/template/dashboard/${this.name}`, {
      params: params,
    });
    return data as MonitorTemplate;
  }

  public async addMonitorTemplate(): Promise<MonitorTemplate> {
    const data: { [key: string]: any } = await axios.post(`observability/template/dashboard`, this);
    return data as MonitorTemplate;
  }

  public async updateMonitorTemplate(): Promise<MonitorTemplate> {
    const data: { [key: string]: any } = await axios.put(`observability/template/dashboard/${this.name}`, this);
    return data as MonitorTemplate;
  }

  public async deleteMonitorTemplate(): Promise<void> {
    await axios.delete(`observability/template/dashboard/${this.name}`);
  }
}
