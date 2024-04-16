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
import { V1Pod } from '@kubernetes/client-node/dist/gen/model/v1Pod';
import { V1PodSpec } from '@kubernetes/client-node/dist/gen/model/v1PodSpec';
import { V1PodStatus } from '@kubernetes/client-node/dist/gen/model/v1PodStatus';
import axios from 'axios';

import { Metadata, initKModel } from './kubernetes';

interface PodExtend {
  getPodListByResourceKind(cluster: string, params: KubePaginationRequest): Promise<KubePaginationResponse<Pod[]>>;
}

export class Pod extends V1Pod implements PodExtend {
  constructor(pod?: { [key: string]: any }) {
    super();
    this.apiVersion = getApiVersion('pod');
    this.kind = 'Pod';
    this.metadata = new Metadata();
    this.spec = initKModel<V1PodSpec>(V1PodSpec.attributeTypeMap);
    this.status = initKModel<V1PodStatus>(V1PodStatus.attributeTypeMap);

    if (pod) Object.assign(this, pod);
  }

  [others: string]: any;

  public async getPodList(cluster: string, params: KubePaginationRequest): Promise<KubePaginationResponse<Pod[]>> {
    const apiVersion: string = getApiVersion('pod');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/pods`,
      {
        params: params,
      },
    );
    return data as KubePaginationResponse<Pod[]>;
  }

  public async getPod(cluster: string, params: KubeRequest = {}): Promise<Pod> {
    const apiVersion: string = getApiVersion('pod');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/pods/${this.metadata.name}`,
      {
        params: params,
      },
    );
    return data as Pod;
  }

  public async addPod(cluster: string): Promise<Pod> {
    const apiVersion: string = getApiVersion('pod');
    const data: { [key: string]: any } = await axios.post(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/pods/${this.metadata.name}`,
      this,
    );
    return data as Pod;
  }

  public async updatePod(cluster: string): Promise<Pod> {
    const apiVersion: string = getApiVersion('pod');
    const data: { [key: string]: any } = await axios.patch(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/pods/${this.metadata.name}`,
      this,
    );
    return data as Pod;
  }

  public async deletePod(cluster: string): Promise<void> {
    const apiVersion: string = getApiVersion('pod');
    await axios.delete(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/pods/${this.metadata.name}`,
    );
  }

  // pod extend
  public async getPodListByResourceKind(
    cluster: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<Pod[]>> {
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/custom/core/v1/namespaces/${this.metadata.namespace}/pods`,
      {
        params: params,
      },
    );
    return data as KubePaginationResponse<Pod[]>;
  }
}
