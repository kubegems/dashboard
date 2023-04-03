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
import { V1Secret } from '@kubernetes/client-node/dist/gen/model/v1Secret';
import axios from 'axios';

import { Metadata } from './kubernetes';

export class Secret extends V1Secret {
  constructor(secret?: { [key: string]: any }) {
    super();
    this.apiVersion = getApiVersion('secret');
    this.kind = 'Secret';
    this.metadata = new Metadata();
    this.immutable = false;
    this.data = {};
    this.stringData = {};
    this.type = '';

    if (secret) Object.assign(this, secret);
  }

  public async getSecretList(
    cluster: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<Secret[]>> {
    const apiVersion: string = getApiVersion('secret');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/secrets`,
      {
        params: params,
      },
    );
    return data as KubePaginationResponse<Secret[]>;
  }

  public async getSecret(cluster: string, params: KubeRequest = {}): Promise<Secret> {
    const apiVersion: string = getApiVersion('secret');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/secrets/${this.metadata.name}`,
      {
        params: params,
      },
    );
    return data as Secret;
  }

  public async addSecret(cluster: string): Promise<Secret> {
    const apiVersion: string = getApiVersion('secret');
    const data: { [key: string]: any } = await axios.post(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/secrets/${this.metadata.name}`,
      this,
    );
    return data as Secret;
  }

  public async updateSecret(cluster: string): Promise<Secret> {
    const apiVersion: string = getApiVersion('secret');
    const data: { [key: string]: any } = await axios.patch(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/secrets/${this.metadata.name}`,
      this,
    );
    return data as Secret;
  }

  public async deleteSecret(cluster: string): Promise<void> {
    const apiVersion: string = getApiVersion('secret');
    await axios.delete(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/secrets/${this.metadata.name}`,
    );
  }
}
