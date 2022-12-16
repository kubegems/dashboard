import axios from 'axios';

import { Metadata } from './kubernetes';
import { getApiVersion } from '@/utils/helpers';

export class Issuer {
  constructor(issuer?: { [key: string]: any }) {
    this.apiVersion = getApiVersion('issuer', 'cert-manager.io/v1');
    this.kind = 'Issuer';
    this.metadata = new Metadata();
    this.spec = {};
    this.status = {};

    if (issuer) Object.assign(this, issuer);
  }

  apiVersion?: string;
  kind?: string;
  metadata?: Metadata;
  spec?: { [key: string]: any };
  status?: { [key: string]: any };

  public async getIssuerList(
    cluster: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<Issuer[]>> {
    const apiVersion: string = getApiVersion('issuer', 'cert-manager.io/v1');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/issuers`,
      {
        params: params,
      },
    );
    return data as KubePaginationResponse<Issuer[]>;
  }

  public async getIssuer(cluster: string, params: KubeRequest = {}): Promise<Issuer> {
    const apiVersion: string = getApiVersion('issuer', 'cert-manager.io/v1');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/issuers/${this.metadata.name}`,
      {
        params: params,
      },
    );
    return data as Issuer;
  }

  public async addIssuer(cluster: string): Promise<Issuer> {
    const apiVersion: string = getApiVersion('issuer', 'cert-manager.io/v1');
    const data: { [key: string]: any } = await axios.post(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/issuers/${this.metadata.name}`,
      this,
    );
    return data as Issuer;
  }

  public async updateIssuer(cluster: string): Promise<Issuer> {
    const apiVersion: string = getApiVersion('issuer', 'cert-manager.io/v1');
    const data: { [key: string]: any } = await axios.patch(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/issuers/${this.metadata.name}`,
      this,
    );
    return data as Issuer;
  }

  public async deleteIssuer(cluster: string): Promise<void> {
    const apiVersion: string = getApiVersion('issuer', 'cert-manager.io/v1');
    await axios.delete(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/issuers/${this.metadata.name}`,
    );
  }
}
