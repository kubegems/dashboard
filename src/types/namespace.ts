import { V1Namespace } from '@kubernetes/client-node/dist/gen/model/v1Namespace';
import { V1NamespaceSpec } from '@kubernetes/client-node/dist/gen/model/v1NamespaceSpec';
import { V1NamespaceStatus } from '@kubernetes/client-node/dist/gen/model/v1NamespaceStatus';
import axios from 'axios';

import { Metadata, initDefaultValueFromKModel } from './base';

export class Namespace extends V1Namespace {
  constructor() {
    super();
    this.apiVersion = 'v1';
    this.kind = 'Namespace';
    this.metadata = new Metadata();
    this.spec = initDefaultValueFromKModel(V1NamespaceSpec.attributeTypeMap);
    this.status = initDefaultValueFromKModel(V1NamespaceStatus.attributeTypeMap);
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
}
