/*
 * Copyright 2022 The kubegems.io Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import axios from 'axios';

import { Metadata } from './kubernetes';

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

  apiVersion = 'edge.kubegems.io/v1beta1';
  kind = 'EdgeHub';
  spec: { [key: string]: any } = {};
  metadata: Metadata = new Metadata();
  status: EdgeHubStatus = new EdgeHubStatus();

  public async getEdgeHubList(params: KubeRequest): Promise<EdgeHub[]> {
    const data: { [key: string]: any } = await axios(`edge-hubs`, { params: params });
    return data as EdgeHub[];
  }

  public async getEdgeHub(params: KubeRequest): Promise<EdgeHub> {
    const data: { [key: string]: any } = await axios(`edge-hubs/${this.metadata.name}`, { params: params });
    return data as EdgeHub;
  }
}
