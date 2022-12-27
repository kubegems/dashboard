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

import { Metadata } from './kubernetes';
import { getApiVersion } from '@/utils/helpers';

class StaticConfig {
  constructor(config?: { [key: string]: any }) {
    if (config) Object.assign(this, config);
  }

  static?: string[] = [];
  labels?: { [key: string]: string } = {};
  relabelingConfigs?: { [key: string]: any }[] = [];
}

class ProbeTargets {
  constructor(spec?: { [key: string]: any }) {
    Object.assign(this, spec);
  }

  staticConfig?: StaticConfig = new StaticConfig();
  ingress?: { [key: string]: any } = {};
}

class ProberSpec {
  constructor(spec?: { [key: string]: any }) {
    if (spec) Object.assign(this, spec);
  }

  url?: string = '';
  scheme?: string = '';
  path?: string = '/probe';
  proxyUrl?: string = '';
}

class PrometheusProbeSpec {
  constructor(spec?: { [key: string]: any }) {
    if (spec) Object.assign(this, spec);
  }

  jobName?: string = '';
  module?: string = 'ping';
  interval?: string = '1m';
  scrapeTimeout?: string = '';
  prober?: ProberSpec = new ProberSpec();
  targets?: ProbeTargets = new ProbeTargets();
}

export class PrometheusProbe {
  constructor(probe?: { [key: string]: any }) {
    if (probe) Object.assign(this, probe);
  }

  apiVersion?: string = getApiVersion('probe', 'monitoring.coreos.com/v1');
  kind?: string = 'PrometheusProbe';
  metadata?: Metadata = new Metadata();
  spec?: PrometheusProbeSpec = new PrometheusProbeSpec();

  public async getPrometheusProbeList(
    cluster: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<PrometheusProbe[]>> {
    const apiVersion: string = getApiVersion('probe', 'monitoring.coreos.com/v1');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/probes`,
      {
        params: params,
      },
    );
    return data as KubePaginationResponse<PrometheusProbe[]>;
  }

  public async getPrometheusProbe(cluster: string, params: KubeRequest = {}): Promise<PrometheusProbe> {
    const apiVersion: string = getApiVersion('probe', 'monitoring.coreos.com/v1');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/probes/${this.metadata.name}`,
      {
        params: params,
      },
    );
    return data as PrometheusProbe;
  }

  public async addPrometheusProbe(cluster: string): Promise<PrometheusProbe> {
    const apiVersion: string = getApiVersion('probe', 'monitoring.coreos.com/v1');
    const data: { [key: string]: any } = await axios.post(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/probes/${this.metadata.name}`,
      this,
    );
    return data as PrometheusProbe;
  }

  public async updatePrometheusProbe(cluster: string): Promise<PrometheusProbe> {
    const apiVersion: string = getApiVersion('probe', 'monitoring.coreos.com/v1');
    const data: { [key: string]: any } = await axios.patch(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/probes/${this.metadata.name}`,
      this,
    );
    return data as PrometheusProbe;
  }

  public async deletePrometheusProbe(cluster: string): Promise<void> {
    const apiVersion: string = getApiVersion('probe', 'monitoring.coreos.com/v1');
    await axios.delete(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/probes/${this.metadata.name}`,
    );
  }
}
