import { V1Secret } from '@kubernetes/client-node/dist/gen/model/v1Secret';
import axios from 'axios';

import { Metadata } from './kubernetes';
import { getApiVersion } from '@/utils/helpers';

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
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/secrets`,
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
