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

class ClusterOutputSpec {
  constructor(spec?: { [key: string]: any }) {
    if (spec) Object.assign(this, spec);
  }

  loggingRef?: string = '';
  enabledNamespaces?: string[] = [];
  [others: string]: any;
}

class ClusterOutputStatus {
  constructor(status?: { [key: string]: any }) {
    if (status) Object.assign(this, status);
  }

  active?: boolean = false;
  problems?: string[] = [];
  problemsCount?: number = 0;
}

export class ClusterOutput {
  constructor(output?: { [key: string]: any }) {
    this.apiVersion = getApiVersion('output', 'logging.banzaicloud.io/v1beta1');
    this.kind = 'ClusterOutput';
    this.metadata = new Metadata();
    this.spec = new ClusterOutputSpec();
    this.status = new ClusterOutputStatus();

    if (output) Object.assign(this, output);
  }

  apiVersion?: string = getApiVersion('output', 'logging.banzaicloud.io/v1beta1');
  kind?: string = 'ClusterOutput';
  metadata?: Metadata = new Metadata();
  spec?: ClusterOutputSpec = new ClusterOutputSpec();
  status?: ClusterOutputStatus = new ClusterOutputStatus();

  public async getClusterOutputList(
    cluster: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<ClusterOutput[]>> {
    const apiVersion: string = getApiVersion('output', 'logging.banzaicloud.io/v1beta1');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/clusteroutputs`,
      {
        params: params,
      },
    );
    return data as KubePaginationResponse<ClusterOutput[]>;
  }

  public async getClusterOutput(cluster: string, params: KubeRequest = {}): Promise<ClusterOutput> {
    const apiVersion: string = getApiVersion('output', 'logging.banzaicloud.io/v1beta1');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/clusteroutputs/${this.metadata.name}`,
      {
        params: params,
      },
    );
    return data as ClusterOutput;
  }

  public async addClusterOutput(cluster: string): Promise<ClusterOutput> {
    const apiVersion: string = getApiVersion('output', 'logging.banzaicloud.io/v1beta1');
    const data: { [key: string]: any } = await axios.post(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/clusteroutputs/${this.metadata.name}`,
      this,
    );
    return data as ClusterOutput;
  }

  public async updateClusterOutput(cluster: string): Promise<ClusterOutput> {
    const apiVersion: string = getApiVersion('output', 'logging.banzaicloud.io/v1beta1');
    const data: { [key: string]: any } = await axios.patch(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/clusteroutputs/${this.metadata.name}`,
      this,
    );
    return data as ClusterOutput;
  }

  public async deleteClusterOutput(cluster: string): Promise<void> {
    const apiVersion: string = getApiVersion('output', 'logging.banzaicloud.io/v1beta1');
    await axios.delete(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/clusteroutputs/${this.metadata.name}`,
    );
  }
}
