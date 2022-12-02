import { V1Node } from '@kubernetes/client-node/dist/gen/model/v1Node';
import { V1NodeSpec } from '@kubernetes/client-node/dist/gen/model/v1NodeSpec';
import { V1NodeStatus } from '@kubernetes/client-node/dist/gen/model/v1NodeStatus';
import axios from 'axios';

import { Metadata, initKModel } from './kubernetes';
import { getApiVersion } from '@/utils/helpers';

interface CordonNode {
  patchCordonNode(cluster: string, schedulable: boolean): Promise<void>;
}

export class Node extends V1Node implements CordonNode {
  constructor(node?: { [key: string]: any }) {
    super();
    this.apiVersion = getApiVersion('node');
    this.kind = 'Node';
    this.metadata = new Metadata();
    this.spec = initKModel<V1NodeSpec>(V1NodeSpec.attributeTypeMap);
    this.status = initKModel<V1NodeStatus>(V1NodeStatus.attributeTypeMap);

    if (node) Object.assign(this, node);
  }

  public async getNodeList(cluster: string, params: KubePaginationRequest): Promise<KubePaginationResponse<Node[]>> {
    const apiVersion = getApiVersion('node');
    const data: { [key: string]: any } = await axios(`proxy/cluster/${cluster}/${apiVersion}/nodes`, {
      params: params,
    });
    return data as KubePaginationResponse<Node[]>;
  }

  public async getNode(cluster: string, params: KubeRequest): Promise<Node> {
    const apiVersion = getApiVersion('node');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/nodes/${this.metadata.name}`,
      {
        params: params,
      },
    );
    return data as Node;
  }

  // CordonNode
  public async patchCordonNode(cluster: string, schedulable: boolean): Promise<void> {
    await axios.patch(`proxy/cluster/${cluster}/custom/core/v1/nodes/${this.metadata.name}/actions/cordon`, {
      Unschedulable: !schedulable,
    });
  }
}
