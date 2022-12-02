import { V1StatefulSet } from '@kubernetes/client-node/dist/gen/model/v1StatefulSet';
import { V1StatefulSetSpec } from '@kubernetes/client-node/dist/gen/model/v1StatefulSetSpec';
import { V1StatefulSetStatus } from '@kubernetes/client-node/dist/gen/model/v1StatefulSetStatus';
import axios from 'axios';

import { Metadata, initKModel } from './kubernetes';
import { getApiVersion } from '@/utils/helpers';

export class StatefulSet extends V1StatefulSet {
  constructor(statefulset?: { [key: string]: any }) {
    super();
    this.apiVersion = getApiVersion('statefulset');
    this.kind = 'StatefulSet';
    this.metadata = new Metadata();
    this.spec = initKModel<V1StatefulSetSpec>(V1StatefulSetSpec.attributeTypeMap);
    this.status = initKModel<V1StatefulSetStatus>(V1StatefulSetStatus.attributeTypeMap);

    if (statefulset) Object.assign(this, statefulset);
  }

  public async getStatefulSetList(
    cluster: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<StatefulSet[]>> {
    const apiVersion: string = getApiVersion('statefulset');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/statefulsets`,
      {
        params: params,
      },
    );
    return data as KubePaginationResponse<StatefulSet[]>;
  }

  public async getStatefulSet(cluster: string, params: KubeRequest = {}): Promise<StatefulSet> {
    const apiVersion: string = getApiVersion('statefulset');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/statefulsets/${this.metadata.name}`,
      {
        params: params,
      },
    );
    return data as StatefulSet;
  }

  public async addStatefulSet(cluster: string): Promise<StatefulSet> {
    const apiVersion: string = getApiVersion('statefulset');
    const data: { [key: string]: any } = await axios.post(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/statefulsets`,
      this,
    );
    return data as StatefulSet;
  }

  public async updateStatefulSet(cluster: string): Promise<StatefulSet> {
    const apiVersion: string = getApiVersion('statefulset');
    const data: { [key: string]: any } = await axios.patch(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/statefulsets/${this.metadata.name}`,
      this,
    );
    return data as StatefulSet;
  }

  public async deleteStatefulSet(cluster: string): Promise<void> {
    const apiVersion: string = getApiVersion('statefulset');
    await axios.delete(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/statefulsets/${this.metadata.name}`,
    );
  }
}
