import { V1Service } from '@kubernetes/client-node/dist/gen/model/v1Service';
import { V1ServiceSpec } from '@kubernetes/client-node/dist/gen/model/v1ServiceSpec';
import { V1ServiceStatus } from '@kubernetes/client-node/dist/gen/model/v1ServiceStatus';
import axios from 'axios';

import { Metadata, initKModel } from './kubernetes';
import { getApiVersion } from '@/utils/helpers';

export class Service extends V1Service {
  constructor(service?: { [key: string]: any }) {
    super();
    this.apiVersion = getApiVersion('service');
    this.kind = 'Service';
    this.metadata = new Metadata();
    this.spec = initKModel<V1ServiceSpec>(V1ServiceSpec.attributeTypeMap);
    this.status = initKModel<V1ServiceStatus>(V1ServiceStatus.attributeTypeMap);

    if (service) Object.assign(this, service);
  }

  public async getServiceList(
    cluster: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<Service[]>> {
    const apiVersion: string = getApiVersion('service');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/services`,
      {
        params: params,
      },
    );
    return data as KubePaginationResponse<Service[]>;
  }

  public async getService(cluster: string, params: KubeRequest = {}): Promise<Service> {
    const apiVersion: string = getApiVersion('service');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/services/${this.metadata.name}`,
      {
        params: params,
      },
    );
    return data as Service;
  }

  public async addService(cluster: string): Promise<Service> {
    const apiVersion: string = getApiVersion('service');
    const data: { [key: string]: any } = await axios.post(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/services/${this.metadata.name}`,
      this,
    );
    return data as Service;
  }

  public async updateService(cluster: string): Promise<Service> {
    const apiVersion: string = getApiVersion('service');
    const data: { [key: string]: any } = await axios.patch(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/services/${this.metadata.name}`,
      this,
    );
    return data as Service;
  }

  public async deleteService(cluster: string): Promise<void> {
    const apiVersion: string = getApiVersion('service');
    await axios.delete(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/services/${this.metadata.name}`,
    );
  }
}
