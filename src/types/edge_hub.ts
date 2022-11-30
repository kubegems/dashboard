import axios from 'axios';

import { Metadata } from './base';

class EdgeHubStatusTunnel {
  constructor(edgeClusterStatusTunnel?: { [key: string]: any }) {
    Object.assign(this, edgeClusterStatusTunnel);
  }

  connected?: boolean = false;
  lastOfflineTimestamp?: Date = undefined;
  lastOnlineTimestamp?: Date = undefined;
}

class EdgeHubStatus {
  constructor(edgeClusterStatus?: { [key: string]: any }) {
    Object.assign(this, edgeClusterStatus);
  }

  address?: string = '';
  phase?: string = '';
  tunnel?: EdgeHubStatusTunnel = new EdgeHubStatusTunnel();
  manufacture?: { [key: string]: string } = {};
}

export class EdgeHub {
  constructor(edgeHub?: { [key: string]: any }) {
    Object.assign(this, edgeHub);
  }

  apiVersion?: string = 'edge.kubegems.io/v1beta1';
  kind?: string = 'EdgeHub';
  spec?: { [key: string]: any } = {};
  metadata?: Metadata = new Metadata();
  status?: EdgeHubStatus = new EdgeHubStatus();

  public async getEdgeHubList(params: KubeRequest): Promise<EdgeHub[]> {
    const data: { [key: string]: any } = await axios(`edge-hubs`, { params: params });
    return data as EdgeHub[];
  }
}
