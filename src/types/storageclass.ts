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
import { V1StorageClass } from '@kubernetes/client-node/dist/gen/model/v1StorageClass';
import axios from 'axios';

import { Metadata } from './kubernetes';
import { getApiVersion } from '@/utils/helpers';

export class StorageClass extends V1StorageClass {
  constructor(storageclass?: { [key: string]: any }) {
    super();
    this.apiVersion = getApiVersion('storageclass', 'storage.k8s.io/v1');
    this.kind = 'StorageClass';
    this.metadata = new Metadata();

    if (storageclass) Object.assign(this, storageclass);
  }

  public async getStorageClassList(
    cluster: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<StorageClass[]>> {
    const apiVersion: string = getApiVersion('storageclass', 'storage.k8s.io/v1');
    const data: { [key: string]: any } = await axios(`proxy/cluster/${cluster}/${apiVersion}/storageclasses`, {
      params: params,
    });
    return data as KubePaginationResponse<StorageClass[]>;
  }

  public async getStorageClass(cluster: string, params: KubeRequest = {}): Promise<StorageClass> {
    const apiVersion: string = getApiVersion('storageclass', 'storage.k8s.io/v1');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/storageclasses/${this.metadata.name}`,
      {
        params: params,
      },
    );
    return data as StorageClass;
  }

  public async addStorageClass(cluster: string): Promise<StorageClass> {
    const apiVersion: string = getApiVersion('storageclass', 'storage.k8s.io/v1');
    const data: { [key: string]: any } = await axios.post(
      `proxy/cluster/${cluster}/${apiVersion}/storageclasses/${this.metadata.name}`,
      this,
    );
    return data as StorageClass;
  }

  public async updateStorageClass(cluster: string): Promise<StorageClass> {
    const apiVersion: string = getApiVersion('storageclass', 'storage.k8s.io/v1');
    const data: { [key: string]: any } = await axios.patch(
      `proxy/cluster/${cluster}/${apiVersion}/storageclasses/${this.metadata.name}`,
      this,
    );
    return data as StorageClass;
  }

  public async deleteStorageClass(cluster: string): Promise<void> {
    const apiVersion: string = getApiVersion('storageclass', 'storage.k8s.io/v1');
    await axios.delete(`proxy/cluster/${cluster}/${apiVersion}/storageclasses/${this.metadata.name}`);
  }
}
