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

class Selector {
  constructor(selector?: { [key: string]: any }) {
    if (selector) Object.assign(this, selector);
  }

  labels?: { [key: string]: string } = {};
  hosts?: string[] = [];
  container_names?: string[] = [];
}

class Match {
  constructor(match?: { [key: string]: any }) {
    if (match) Object.assign(this, match);
  }

  select?: Selector;
  exclude?: Selector;
}

class FlowSpec {
  constructor(spec?: { [key: string]: any }) {
    if (spec) Object.assign(this, spec);
  }

  selectors?: { [key: string]: string } = {};
  match?: Match = new Match();
  filters?: any = {};
  loggingRef?: string = '';
  outputRefs?: string[] = [];
  globalOutputRefs?: string[] = [];
  localOutputRefs?: string[] = [];
}

class FlowStatus {
  constructor(status?: { [key: string]: any }) {
    if (status) Object.assign(this, status);
  }

  active?: boolean = false;
  problems?: string[] = [];
  problemsCount?: number = 0;
}

export class Flow {
  constructor(flow?: { [key: string]: any }) {
    this.apiVersion = getApiVersion('flow', 'logging.banzaicloud.io/v1beta1');
    this.kind = 'Flow';
    this.metadata = new Metadata();
    this.spec = new FlowSpec();
    this.status = new FlowStatus();

    if (flow) Object.assign(this, flow);
  }

  apiVersion?: string = getApiVersion('flow', 'logging.banzaicloud.io/v1beta1');
  kind?: string = 'Flow';
  metadata?: Metadata = new Metadata();
  spec?: FlowSpec = new FlowSpec();
  status?: FlowStatus = new FlowStatus();

  public async getFlowList(cluster: string, params: KubePaginationRequest): Promise<KubePaginationResponse<Flow[]>> {
    const apiVersion: string = getApiVersion('flow', 'logging.banzaicloud.io/v1beta1');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/flows`,
      {
        params: params,
      },
    );
    return data as KubePaginationResponse<Flow[]>;
  }

  public async getFlow(cluster: string, params: KubeRequest = {}): Promise<Flow> {
    const apiVersion: string = getApiVersion('flow', 'logging.banzaicloud.io/v1beta1');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/flows/${this.metadata.name}`,
      {
        params: params,
      },
    );
    return data as Flow;
  }

  public async addFlow(cluster: string): Promise<Flow> {
    const apiVersion: string = getApiVersion('flow', 'logging.banzaicloud.io/v1beta1');
    const data: { [key: string]: any } = await axios.post(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/flows/${this.metadata.name}`,
      this,
    );
    return data as Flow;
  }

  public async updateFlow(cluster: string): Promise<Flow> {
    const apiVersion: string = getApiVersion('flow', 'logging.banzaicloud.io/v1beta1');
    const data: { [key: string]: any } = await axios.patch(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/flows/${this.metadata.name}`,
      this,
    );
    return data as Flow;
  }

  public async deleteFlow(cluster: string): Promise<void> {
    const apiVersion: string = getApiVersion('flow', 'logging.banzaicloud.io/v1beta1');
    await axios.delete(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/flows/${this.metadata.name}`,
    );
  }
}
