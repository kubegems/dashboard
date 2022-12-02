import { V1StorageClass } from '@kubernetes/client-node/dist/gen/model/v1StorageClass';
import axios from 'axios';

import { Metadata } from './kubernetes';
import { getApiVersion } from '@/utils/helpers';

export class StorageClass extends V1StorageClass {
  constructor(storageclass?: { [key: string]: any }) {
    super();
    this.apiVersion = getApiVersion('storageclass');
    this.kind = 'StorageClass';
    this.metadata = new Metadata();

    if (storageclass) Object.assign(this, storageclass);
  }

  public async getStorageClassList(
    cluster: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<StorageClass[]>> {
    const apiVersion: string = getApiVersion('storageclass');
    const data: { [key: string]: any } = await axios(`proxy/cluster/${cluster}/${apiVersion}/storageclasses`, {
      params: params,
    });
    return data as KubePaginationResponse<StorageClass[]>;
  }

  public async getStorageClass(cluster: string, params: KubeRequest): Promise<StorageClass> {
    const apiVersion: string = getApiVersion('storageclass');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/storageclasses/${this.metadata.name}`,
      {
        params: params,
      },
    );
    return data as StorageClass;
  }

  public async addStorageClass(cluster: string): Promise<StorageClass> {
    const apiVersion: string = getApiVersion('storageclass');
    const data: { [key: string]: any } = await axios.post(
      `proxy/cluster/${cluster}/${apiVersion}/storageclasses`,
      this,
    );
    return data as StorageClass;
  }

  public async updateStorageClass(cluster: string): Promise<StorageClass> {
    const apiVersion: string = getApiVersion('storageclass');
    const data: { [key: string]: any } = await axios.patch(
      `proxy/cluster/${cluster}/${apiVersion}/storageclasses/${this.metadata.name}`,
      this,
    );
    return data as StorageClass;
  }

  public async deleteStorageClass(cluster: string): Promise<void> {
    const apiVersion: string = getApiVersion('storageclass');
    await axios.delete(`proxy/cluster/${cluster}/${apiVersion}/storageclasses/${this.metadata.name}`);
  }
}
