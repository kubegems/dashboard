import { V1Namespace } from '@kubernetes/client-node/dist/gen/model/v1Namespace';
import { V1NamespaceSpec } from '@kubernetes/client-node/dist/gen/model/v1NamespaceSpec';
import { V1NamespaceStatus } from '@kubernetes/client-node/dist/gen/model/v1NamespaceStatus';
import axios from 'axios';

import { Metadata, initKModel } from './kubernetes';

export class Namespace extends V1Namespace {
  constructor(namespace?: { [key: string]: any }) {
    super();
    this.apiVersion = 'v1';
    this.kind = 'Namespace';
    this.metadata = new Metadata();
    this.spec = initKModel<V1NamespaceSpec>(V1NamespaceSpec.attributeTypeMap);
    this.status = initKModel<V1NamespaceStatus>(V1NamespaceStatus.attributeTypeMap);

    if (namespace) Object.assign(this, namespace);
  }

  public async getNamespaceList(
    cluster: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<Namespace[]>> {
    const data: { [key: string]: any } = await axios(`edge-clusters/${cluster}/proxy/core/v1/namespaces`, {
      params: params,
    });
    return data as KubePaginationResponse<Namespace[]>;
  }

  public async getNamespace(cluster: string, params: KubeRequest): Promise<Namespace> {
    const data: { [key: string]: any } = await axios(
      `edge-clusters/${cluster}/proxy/core/v1/namespaces/${this.metadata.name}`,
      {
        params: params,
      },
    );
    return data as Namespace;
  }

  public async addNamespace(cluster: string): Promise<Namespace> {
    const data: { [key: string]: any } = await axios.post(`proxy/cluster/${cluster}/v1/namespaces`, this);
    return data as Namespace;
  }

  public async updateNamespace(cluster: string): Promise<Namespace> {
    const data: { [key: string]: any } = await axios.patch(
      `proxy/cluster/${cluster}/v1/namespaces/${this.metadata.name}`,
      this,
    );
    return data as Namespace;
  }

  public async deleteNamespace(cluster: string): Promise<void> {
    await axios.delete(`proxy/cluster/${cluster}/v1/namespaces/${this.metadata.name}`);
  }
}
