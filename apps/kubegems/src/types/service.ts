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
import { V1Service } from '@kubernetes/client-node/dist/gen/model/v1Service';
import { V1ServiceSpec } from '@kubernetes/client-node/dist/gen/model/v1ServiceSpec';
import { V1ServiceStatus } from '@kubernetes/client-node/dist/gen/model/v1ServiceStatus';
import axios from 'axios';

import { Metadata, initKModel } from './kubernetes';

export class Service extends V1Service {
  constructor(service?: { [key: string]: any }) {
    super();
    this.apiVersion = getApiVersion('service');
    this.kind = 'Service';
    this.metadata = new Metadata();
    this.spec = initKModel<V1ServiceSpec>(V1ServiceSpec.attributeTypeMap);
    this.status = initKModel<V1ServiceStatus>(V1ServiceStatus.attributeTypeMap);

    if (service) Object.assign(this, service);
  }

  public async getServiceList(
    cluster: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<Service[]>> {
    const apiVersion: string = getApiVersion('service');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/services`,
      {
        params: params,
      },
    );
    return data as KubePaginationResponse<Service[]>;
  }

  public async getService(cluster: string, params: KubeRequest = {}): Promise<Service> {
    const apiVersion: string = getApiVersion('service');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/services/${this.metadata.name}`,
      {
        params: params,
      },
    );
    return data as Service;
  }

  public async addService(cluster: string): Promise<Service> {
    const apiVersion: string = getApiVersion('service');
    const data: { [key: string]: any } = await axios.post(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/services/${this.metadata.name}`,
      this,
    );
    return data as Service;
  }

  public async updateService(cluster: string): Promise<Service> {
    const apiVersion: string = getApiVersion('service');
    const data: { [key: string]: any } = await axios.patch(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/services/${this.metadata.name}`,
      this,
    );
    return data as Service;
  }

  public async deleteService(cluster: string): Promise<void> {
    const apiVersion: string = getApiVersion('service');
    await axios.delete(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/services/${this.metadata.name}`,
    );
  }
}
