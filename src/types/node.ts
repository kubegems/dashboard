import { V1Node } from '@kubernetes/client-node/dist/gen/model/v1Node';
import { V1NodeSpec } from '@kubernetes/client-node/dist/gen/model/v1NodeSpec';
import { V1NodeStatus } from '@kubernetes/client-node/dist/gen/model/v1NodeStatus';
import axios from 'axios';

import { Metadata, initDefaultValueFromKModel } from './base';
import { getApiVersion } from '@/utils/helpers';

export class Node extends V1Node {
  constructor() {
    super();
    this.apiVersion = 'v1';
    this.kind = 'Node';
    this.metadata = new Metadata();
    this.spec = initDefaultValueFromKModel(V1NodeSpec.attributeTypeMap);
    this.status = initDefaultValueFromKModel(V1NodeStatus.attributeTypeMap);
  }

  public async getNodeList(cluster: string, params: KubePaginationRequest): Promise<KubePaginationResponse<Node[]>> {
    const apiVersion = getApiVersion('node');
    const data: { [key: string]: any } = await axios(`edge-clusters/${cluster}/proxy/${apiVersion}/nodes`, {
      params: params,
    });
    return data as KubePaginationResponse<Node[]>;
  }

  public async getNode(cluster: string, params: KubeRequest): Promise<Node> {
    const apiVersion = getApiVersion('node');
    const data: { [key: string]: any } = await axios(
      `edge-clusters/${cluster}/proxy/${apiVersion}/nodes/${this.metadata.name}`,
      {
        params: params,
      },
    );
    return data as Node;
  }
}
