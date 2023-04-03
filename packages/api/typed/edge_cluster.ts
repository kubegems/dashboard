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

class EdgeClusterStatusRegister {
  constructor(edgeClusterStatusRegister?: { [key: string]: any }) {
    Object.assign(this, edgeClusterStatusRegister);
  }

  url?: string = '';
  lastRegisterToken?: string = '';
  lastRegister?: Date = undefined;
}

class EdgeClusterStatusTunnel {
  constructor(edgeClusterStatusTunnel?: { [key: string]: any }) {
    Object.assign(this, edgeClusterStatusTunnel);
  }

  connected?: boolean = false;
  lastHeartBeatTimestamp?: Date = undefined;
  lastOfflineTimestamp?: Date = undefined;
  lastOnlineTimestamp?: Date = undefined;
}

class EdgeClusterStatus {
  constructor(edgeClusterStatus?: { [key: string]: any }) {
    Object.assign(this, edgeClusterStatus);
  }

  phase = '';
  register: EdgeClusterStatusRegister = new EdgeClusterStatusRegister();
  tunnel: EdgeClusterStatusTunnel = new EdgeClusterStatusTunnel();
  manufacture: { [key: string]: string } = {};
}

class EdgeClusterSpecRegister {
  constructor(edgeClusterSpecRegister?: { [key: string]: any }) {
    Object.assign(this, edgeClusterSpecRegister);
  }

  hubName = '';
  image = '';
  bootstrapToken = '';
}

class EdgeClusterSpec {
  constructor(edgeClusterSpec?: { [key: string]: any }) {
    Object.assign(this, edgeClusterSpec);
  }

  register: EdgeClusterSpecRegister = new EdgeClusterSpecRegister();
}

interface EdgeStatistics {
  getStatistics(): Promise<{ [key: string]: any }>;
}

export class EdgeCluster implements EdgeStatistics {
  constructor(edgeCluster?: { [key: string]: any }) {
    Object.assign(this, edgeCluster);
  }

  apiVersion = 'edge.kubegems.io/v1beta1';
  kind = 'EdgeCluster';
  metadata: Metadata = new Metadata();
  spec: EdgeClusterSpec = new EdgeClusterSpec();
  status: EdgeClusterStatus = new EdgeClusterStatus();

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

  // EdgeStatistics
  public async getStatistics(): Promise<{ [key: string]: any }> {
    const data: { [key: string]: any } = await axios(
      `edge-clusters/${this.metadata.name}/proxy/custom/statistics.system/v1/all`,
    );
    return data;
  }
}
