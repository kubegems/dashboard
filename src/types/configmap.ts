import { V1ConfigMap } from '@kubernetes/client-node/dist/gen/model/v1ConfigMap';
import axios from 'axios';

import { Metadata } from './kubernetes';
import { getApiVersion } from '@/utils/helpers';

export class ConfigMap extends V1ConfigMap {
  constructor(configmap?: { [key: string]: any }) {
    super();
    this.apiVersion = getApiVersion('configmap');
    this.kind = 'ConfigMap';
    this.metadata = new Metadata();
    this.immutable = false;
    this.binaryData = {};
    this.data = {};

    if (configmap) Object.assign(this, configmap);
  }

  public async getConfigMapList(
    cluster: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<ConfigMap[]>> {
    const apiVersion: string = getApiVersion('configmap');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/configmaps`,
      {
        params: params,
      },
    );
    return data as KubePaginationResponse<ConfigMap[]>;
  }

  public async getConfigMap(cluster: string, params: KubeRequest): Promise<ConfigMap> {
    const apiVersion: string = getApiVersion('configmap');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/configmaps/${this.metadata.name}`,
      {
        params: params,
      },
    );
    return data as ConfigMap;
  }

  public async addConfigMap(cluster: string): Promise<ConfigMap> {
    const apiVersion: string = getApiVersion('configmap');
    const data: { [key: string]: any } = await axios.post(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/configmaps`,
      this,
    );
    return data as ConfigMap;
  }

  public async updateConfigMap(cluster: string): Promise<ConfigMap> {
    const apiVersion: string = getApiVersion('configmap');
    const data: { [key: string]: any } = await axios.patch(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/configmaps/${this.metadata.name}`,
      this,
    );
    return data as ConfigMap;
  }

  public async deleteConfigMap(cluster: string): Promise<void> {
    const apiVersion: string = getApiVersion('configmap');
    await axios.delete(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/configmaps/${this.metadata.name}`,
    );
  }
}
