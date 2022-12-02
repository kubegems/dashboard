import { V1Ingress } from '@kubernetes/client-node/dist/gen/model/v1Ingress';
import { V1IngressSpec } from '@kubernetes/client-node/dist/gen/model/v1IngressSpec';
import { V1IngressStatus } from '@kubernetes/client-node/dist/gen/model/v1IngressStatus';
import axios from 'axios';

import { Metadata, initKModel } from './kubernetes';
import { getApiVersion } from '@/utils/helpers';

export class Ingress extends V1Ingress {
  constructor(ingress?: { [key: string]: any }) {
    super();
    this.apiVersion = getApiVersion('ingress');
    this.kind = 'Ingress';
    this.metadata = new Metadata();
    this.spec = initKModel<V1IngressSpec>(V1IngressSpec.attributeTypeMap);
    this.status = initKModel<V1IngressStatus>(V1IngressStatus.attributeTypeMap);

    if (ingress) Object.assign(this, ingress);
  }

  public async getIngressList(
    cluster: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<Ingress[]>> {
    const apiVersion: string = getApiVersion('ingress');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/ingresses`,
      {
        params: params,
      },
    );
    return data as KubePaginationResponse<Ingress[]>;
  }

  public async getIngress(cluster: string, params: KubeRequest = {}): Promise<Ingress> {
    const apiVersion: string = getApiVersion('ingress');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/ingresses/${this.metadata.name}`,
      {
        params: params,
      },
    );
    return data as Ingress;
  }

  public async addIngress(cluster: string): Promise<Ingress> {
    const apiVersion: string = getApiVersion('ingress');
    const data: { [key: string]: any } = await axios.post(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/ingresses`,
      this,
    );
    return data as Ingress;
  }

  public async updateIngress(cluster: string): Promise<Ingress> {
    const apiVersion: string = getApiVersion('ingress');
    const data: { [key: string]: any } = await axios.patch(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/ingresses/${this.metadata.name}`,
      this,
    );
    return data as Ingress;
  }

  public async deleteIngress(cluster: string): Promise<void> {
    const apiVersion: string = getApiVersion('ingress');
    await axios.delete(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/ingresses/${this.metadata.name}`,
    );
  }
}
