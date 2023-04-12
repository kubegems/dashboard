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

import { getApiVersion } from '@kubegems/libs/utils/helpers';
import axios from 'axios';

import { Metadata } from './kubernetes';

class ServiceMonitorSpec {
  constructor(spec?: { [key: string]: any }) {
    if (spec) Object.assign(this, spec);
  }

  jobLabel?: string = '';
  targetLabels?: string[] = [];
  podTargetLabels?: string[] = [];
  endpoints?: any[] = [];
  selector?: any = {};
  namespaceSelector?: any = {};
  sampleLimit?: number;
  targetLimit?: number;
  labelLimit?: number;
  labelNameLengthLimit?: number;
  labelValueLengthLimit?: number;
  attachMetadata?: any;
}

export class ServiceMonitor {
  constructor(servicemonitor?: { [key: string]: any }) {
    this.apiVersion = getApiVersion('servicemonitor', 'monitoring.coreos.com/v1');
    this.kind = 'ServiceMonitor';
    this.metadata = new Metadata();
    this.spec = new ServiceMonitorSpec();

    if (servicemonitor) Object.assign(this, servicemonitor);
  }

  apiVersion?: string = getApiVersion('servicemonitor', 'monitoring.coreos.com/v1');
  kind?: string = 'ServiceMonitor';
  metadata?: Metadata = new Metadata();
  spec?: ServiceMonitorSpec = new ServiceMonitorSpec();

  public async getServiceMonitorList(
    cluster: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<ServiceMonitor[]>> {
    const apiVersion: string = getApiVersion('servicemonitor', 'monitoring.coreos.com/v1');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/servicemonitors`,
      {
        params: params,
      },
    );
    return data as KubePaginationResponse<ServiceMonitor[]>;
  }

  public async getServiceMonitor(cluster: string, params: KubeRequest = {}): Promise<ServiceMonitor> {
    const apiVersion: string = getApiVersion('servicemonitor', 'monitoring.coreos.com/v1');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/servicemonitors/${this.metadata.name}`,
      {
        params: params,
      },
    );
    return data as ServiceMonitor;
  }

  public async addServiceMonitor(cluster: string): Promise<ServiceMonitor> {
    const apiVersion: string = getApiVersion('servicemonitor', 'monitoring.coreos.com/v1');
    const data: { [key: string]: any } = await axios.post(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/servicemonitors/${this.metadata.name}`,
      this,
    );
    return data as ServiceMonitor;
  }

  public async updateServiceMonitor(cluster: string): Promise<ServiceMonitor> {
    const apiVersion: string = getApiVersion('servicemonitor', 'monitoring.coreos.com/v1');
    const data: { [key: string]: any } = await axios.patch(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/servicemonitors/${this.metadata.name}`,
      this,
    );
    return data as ServiceMonitor;
  }

  public async deleteServiceMonitor(cluster: string): Promise<void> {
    const apiVersion: string = getApiVersion('servicemonitor', 'monitoring.coreos.com/v1');
    await axios.delete(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/servicemonitors/${this.metadata.name}`,
    );
  }
}
