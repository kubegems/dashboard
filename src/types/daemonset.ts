import { V1DaemonSet } from '@kubernetes/client-node/dist/gen/model/v1DaemonSet';
import { V1DaemonSetSpec } from '@kubernetes/client-node/dist/gen/model/v1DaemonSetSpec';
import { V1DaemonSetStatus } from '@kubernetes/client-node/dist/gen/model/v1DaemonSetStatus';
import axios from 'axios';

import { Metadata, initKModel } from './kubernetes';
import { getApiVersion } from '@/utils/helpers';

export class DaemonSet extends V1DaemonSet {
  constructor(daemonset?: { [key: string]: any }) {
    super();
    this.apiVersion = getApiVersion('daemonset');
    this.kind = 'DaemonSet';
    this.metadata = new Metadata();
    this.spec = initKModel<V1DaemonSetSpec>(V1DaemonSetSpec.attributeTypeMap);
    this.status = initKModel<V1DaemonSetStatus>(V1DaemonSetStatus.attributeTypeMap);

    if (daemonset) Object.assign(this, daemonset);
  }

  public async getDaemonSetList(
    cluster: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<DaemonSet[]>> {
    const apiVersion: string = getApiVersion('daemonset');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/daemonsets`,
      {
        params: params,
      },
    );
    return data as KubePaginationResponse<DaemonSet[]>;
  }

  public async getDaemonSet(cluster: string, params: KubeRequest): Promise<DaemonSet> {
    const apiVersion: string = getApiVersion('daemonset');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/daemonsets/${this.metadata.name}`,
      {
        params: params,
      },
    );
    return data as DaemonSet;
  }

  public async addDaemonSet(cluster: string): Promise<DaemonSet> {
    const apiVersion: string = getApiVersion('daemonset');
    const data: { [key: string]: any } = await axios.post(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/daemonsets`,
      this,
    );
    return data as DaemonSet;
  }

  public async updateDaemonSet(cluster: string): Promise<DaemonSet> {
    const apiVersion: string = getApiVersion('daemonset');
    const data: { [key: string]: any } = await axios.patch(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/daemonsets/${this.metadata.name}`,
      this,
    );
    return data as DaemonSet;
  }

  public async deleteDaemonSet(cluster: string): Promise<void> {
    const apiVersion: string = getApiVersion('daemonset');
    await axios.delete(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/daemonsets/${this.metadata.name}`,
    );
  }
}
