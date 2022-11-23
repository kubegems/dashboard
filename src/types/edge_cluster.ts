import axios from 'axios';

import { Metadata } from './base';

class EdgeClusterStatus {
  constructor(edgeClusterStatus?: { [key: string]: any }) {
    Object.assign(this, edgeClusterStatus);
  }

  phase?: string = '';
  register?: EdgeClusterSpecRegister = new EdgeClusterSpecRegister();
  tunnel?: { [key: string]: string | Date | boolean } = {};
  manufacture?: { [key: string]: string } = {};
}

class EdgeClusterSpecRegister {
  constructor(edgeClusterSpecRegister?: { [key: string]: any }) {
    Object.assign(this, edgeClusterSpecRegister);
  }

  hubName?: string = '';
  image?: string = '';
  bootstrapToken?: string = '';
}

class EdgeClusterSpec {
  constructor(edgeClusterSpec?: { [key: string]: any }) {
    Object.assign(this, edgeClusterSpec);
  }

  register?: EdgeClusterSpecRegister = new EdgeClusterSpecRegister();
}

export class EdgeHub {
  constructor(edgeHub?: { [key: string]: any }) {
    Object.assign(this, edgeHub);
  }

  name = '';
  address = '';
  connected = false;

  public async getEdgeHubList(params: KubeRequest): Promise<EdgeHub[]> {
    const data: { [key: string]: any } = await axios(`edge-hubs`, { params: params });
    return data as EdgeHub[];
  }
}

export class EdgeCluster {
  constructor(edgeCluster?: { [key: string]: any }) {
    Object.assign(this, edgeCluster);
  }

  apiVersion?: string = 'edge.kubegems.io/v1beta1';
  kind?: string = 'EdgeCluster';
  metadata?: Metadata = new Metadata();
  spec?: EdgeClusterSpec = new EdgeClusterSpec();
  status?: EdgeClusterStatus = new EdgeClusterStatus();

  public async getEdgeClusterList(params: KubePaginationRequest): Promise<KubePaginationResponse<EdgeCluster[]>> {
    const data: { [key: string]: any } = await axios(`edge-clusters`, { params: params });
    return data as KubePaginationResponse<EdgeCluster[]>;
  }

  public async getEdgeCluster(params?: KubeRequest): Promise<EdgeCluster> {
    const data: { [key: string]: any } = await axios(`edge-clusters/${this.metadata.name}`, { params: params });
    return data as EdgeCluster;
  }

  public async addEdgeCluster(): Promise<EdgeCluster> {
    const data: { [key: string]: any } = await axios.post(`edge-clusters`, this);
    return data as EdgeCluster;
  }

  public async updateEdgeCluster(): Promise<EdgeCluster> {
    const data: { [key: string]: any } = await axios.put(`edge-clusters/${this.metadata.name}`, this);
    return data as EdgeCluster;
  }

  public async deleteEdgeCluster(): Promise<void> {
    await axios.delete(`edge-clusters/${this.metadata.name}`);
  }
}
