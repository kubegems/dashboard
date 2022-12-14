import axios from 'axios';

import { Metadata } from './kubernetes';
import { getApiVersion } from '@/utils/helpers';

export class Certificate {
  constructor(certificate?: { [key: string]: any }) {
    this.apiVersion = getApiVersion('certificate', 'cert-manager.io/v1');
    this.kind = 'Certificate';
    this.metadata = new Metadata();
    this.spec = {};
    this.status = {};

    if (certificate) Object.assign(this, certificate);
  }

  apiVersion?: string;
  kind?: string;
  metadata?: Metadata;
  spec?: { [key: string]: any };
  status?: { [key: string]: any };

  public async getCertificateList(
    cluster: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<Certificate[]>> {
    const apiVersion: string = getApiVersion('certificate', 'cert-manager.io/v1');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/certificates`,
      {
        params: params,
      },
    );
    return data as KubePaginationResponse<Certificate[]>;
  }

  public async getCertificate(cluster: string, params: KubeRequest = {}): Promise<Certificate> {
    const apiVersion: string = getApiVersion('certificate', 'cert-manager.io/v1');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/certificates/${this.metadata.name}`,
      {
        params: params,
      },
    );
    return data as Certificate;
  }

  public async addCertificate(cluster: string): Promise<Certificate> {
    const apiVersion: string = getApiVersion('certificate', 'cert-manager.io/v1');
    const data: { [key: string]: any } = await axios.post(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/certificates`,
      this,
    );
    return data as Certificate;
  }

  public async updateCertificate(cluster: string): Promise<Certificate> {
    const apiVersion: string = getApiVersion('certificate', 'cert-manager.io/v1');
    const data: { [key: string]: any } = await axios.patch(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/certificates/${this.metadata.name}`,
      this,
    );
    return data as Certificate;
  }

  public async deleteCertificate(cluster: string): Promise<void> {
    const apiVersion: string = getApiVersion('certificate', 'cert-manager.io/v1');
    await axios.delete(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/certificates/${this.metadata.name}`,
    );
  }
}
