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
import { V1PersistentVolumeClaim } from '@kubernetes/client-node/dist/gen/model/v1PersistentVolumeClaim';
import { V1PersistentVolumeClaimSpec } from '@kubernetes/client-node/dist/gen/model/v1PersistentVolumeClaimSpec';
import { V1PersistentVolumeClaimStatus } from '@kubernetes/client-node/dist/gen/model/v1PersistentVolumeClaimStatus';
import axios from 'axios';

import { Metadata, initKModel } from './kubernetes';
import { getApiVersion } from '@/utils/helpers';

export class PersistentVolumeClaim extends V1PersistentVolumeClaim {
  constructor(persistentvolumeclaim?: { [key: string]: any }) {
    super();
    this.apiVersion = getApiVersion('persistentvolumeclaim');
    this.kind = 'PersistentVolumeClaim';
    this.metadata = new Metadata();
    this.spec = initKModel<V1PersistentVolumeClaimSpec>(V1PersistentVolumeClaimSpec.attributeTypeMap);
    this.status = initKModel<V1PersistentVolumeClaimStatus>(V1PersistentVolumeClaimStatus.attributeTypeMap);

    if (persistentvolumeclaim) Object.assign(this, persistentvolumeclaim);
  }

  public async getPersistentVolumeClaimList(
    cluster: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<PersistentVolumeClaim[]>> {
    const apiVersion: string = getApiVersion('persistentvolumeclaim');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/persistentvolumeclaims`,
      {
        params: params,
      },
    );
    return data as KubePaginationResponse<PersistentVolumeClaim[]>;
  }

  public async getPersistentVolumeClaim(cluster: string, params: KubeRequest = {}): Promise<PersistentVolumeClaim> {
    const apiVersion: string = getApiVersion('persistentvolumeclaim');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/persistentvolumeclaims/${this.metadata.name}`,
      {
        params: params,
      },
    );
    return data as PersistentVolumeClaim;
  }

  public async addPersistentVolumeClaim(cluster: string): Promise<PersistentVolumeClaim> {
    const apiVersion: string = getApiVersion('persistentvolumeclaim');
    const data: { [key: string]: any } = await axios.post(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/persistentvolumeclaims/${this.metadata.name}`,
      this,
    );
    return data as PersistentVolumeClaim;
  }

  public async updatePersistentVolumeClaim(cluster: string): Promise<PersistentVolumeClaim> {
    const apiVersion: string = getApiVersion('persistentvolumeclaim');
    const data: { [key: string]: any } = await axios.patch(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/persistentvolumeclaims/${this.metadata.name}`,
      this,
    );
    return data as PersistentVolumeClaim;
  }

  public async deletePersistentVolumeClaim(cluster: string): Promise<void> {
    const apiVersion: string = getApiVersion('persistentvolumeclaim');
    await axios.delete(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/persistentvolumeclaims/${this.metadata.name}`,
    );
  }
}
