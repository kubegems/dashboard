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
import { V1Deployment } from '@kubernetes/client-node/dist/gen/model/v1Deployment';
import { V1DeploymentSpec } from '@kubernetes/client-node/dist/gen/model/v1DeploymentSpec';
import { V1DeploymentStatus } from '@kubernetes/client-node/dist/gen/model/v1DeploymentStatus';
import axios from 'axios';

import { Metadata, initKModel } from './kubernetes';
import { getApiVersion } from '@/utils/helpers';

export class Deployment extends V1Deployment {
  constructor(deployment?: { [key: string]: any }) {
    super();
    this.apiVersion = getApiVersion('deployment');
    this.kind = 'Deployment';
    this.metadata = new Metadata();
    this.spec = initKModel<V1DeploymentSpec>(V1DeploymentSpec.attributeTypeMap);
    this.status = initKModel<V1DeploymentStatus>(V1DeploymentStatus.attributeTypeMap);

    if (deployment) Object.assign(this, deployment);
  }

  public async getDeploymentList(
    cluster: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<Deployment[]>> {
    const apiVersion: string = getApiVersion('deployment');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/deployments`,
      {
        params: params,
      },
    );
    return data as KubePaginationResponse<Deployment[]>;
  }

  public async getDeployment(cluster: string, params: KubeRequest = {}): Promise<Deployment> {
    const apiVersion: string = getApiVersion('deployment');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/deployments/${this.metadata.name}`,
      {
        params: params,
      },
    );
    return data as Deployment;
  }

  public async addDeployment(cluster: string): Promise<Deployment> {
    const apiVersion: string = getApiVersion('deployment');
    const data: { [key: string]: any } = await axios.post(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/deployments/${this.metadata.name}`,
      this,
    );
    return data as Deployment;
  }

  public async updateDeployment(cluster: string): Promise<Deployment> {
    const apiVersion: string = getApiVersion('deployment');
    const data: { [key: string]: any } = await axios.patch(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/deployments/${this.metadata.name}`,
      this,
    );
    return data as Deployment;
  }

  public async deleteDeployment(cluster: string): Promise<void> {
    const apiVersion: string = getApiVersion('deployment');
    await axios.delete(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/deployments/${this.metadata.name}`,
    );
  }
}
